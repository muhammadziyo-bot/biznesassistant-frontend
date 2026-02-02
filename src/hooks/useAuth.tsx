import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import axios from 'axios';
import api from '../api/axios';
import { useTranslation } from './useTranslation';

interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: string;
  language: string;
  company_id: number | null;
  tenant_id: number | null;
}

interface Tenant {
  id: number;
  name: string;
  tax_id: string;
  email: string;
  subscription_tier: string;
  subscription_status: string;
  trial_ends_at: string | null;
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  registerBusiness: (businessData: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context as any;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/api/auth/me');
      setUser(response.data);
      
      // If user has tenant_id, fetch tenant info
      if (response.data.tenant_id) {
        await fetchTenantInfo(response.data.tenant_id);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantInfo = async (tenantId: number) => {
    try {
      // For now, we'll store basic tenant info from user context
      // In a real implementation, you might have a separate endpoint
      const response = await api.get(`/api/registration/subscription-tiers`);
      // Store tenant info - this would come from a dedicated endpoint
      setTenant({
        id: tenantId,
        name: response.data?.business_name || t('subscription.defaultCompany', 'Default Company'),
        tax_id: '',
        email: '',
        subscription_tier: 'basic',
        subscription_status: 'trial',
        trial_ends_at: null
      });
    } catch (error) {
      console.error('Failed to fetch tenant info:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);
      
      const response = await api.post('/api/auth/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      
      await fetchUser();
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  };

  const register = async (userData: any) => {
    try {
      await api.post('/api/auth/register', userData);
      
      // Don't auto-login after registration - let user go to login page manually
      // await login(userData.email, userData.password);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  };

  const registerBusiness = async (businessData: any) => {
    try {
      // Convert employee_count to int (it comes as string from form)
      const payload = {
        ...businessData,
        employee_count: businessData.employee_count ? parseInt(businessData.employee_count.match(/\d+/)[0]) : null
      };
      
      const response = await api.post('/api/registration/register-business', payload);
      
      // Return the response data to show company code
      return response.data;
      
      // Don't set user/tenant info - let them login manually
      // setUser({...});
      // setTenant({...});
      
      setLoading(false);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Business registration failed');
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setTenant(null);
  };

  // Helper function to completely clear auth state (for testing/debugging)
  const clearAuth = () => {
    localStorage.removeItem('token');
    setUser(null);
    setTenant(null);
    setLoading(false);
  };

  const value: AuthContextType = {
    user,
    tenant,
    loading,
    login,
    register,
    registerBusiness,
    logout,
    refreshUser,
    clearAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
