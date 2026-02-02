import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import BusinessRegistration from './pages/BusinessRegistration';
import Dashboard from './pages/Dashboard';
import Accounting from './pages/Accounting';
import CRM from './pages/CRM';
import Invoices from './pages/Invoices';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';

// Hooks
import { useAuth } from './hooks/useAuth';
import { initializeTranslations } from './utils/i18n';

// Create a client
const queryClient = new QueryClient();

function App() {
  const { user, loading } = useAuth();
  const [translationsReady, setTranslationsReady] = useState(false);

  useEffect(() => {
    // Initialize translations when app starts
    initializeTranslations().then(() => {
      setTranslationsReady(true);
    });
  }, []);

  if (loading || !translationsReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route 
              path="/login" 
              element={!user ? <Login /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/register" 
              element={!user ? <Register /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/business-registration" 
              element={!user ? <BusinessRegistration /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/register-business" 
              element={!user ? <BusinessRegistration /> : <Navigate to="/dashboard" />} 
            />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="accounting" element={<Accounting />} />
              <Route path="crm" element={<CRM />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
