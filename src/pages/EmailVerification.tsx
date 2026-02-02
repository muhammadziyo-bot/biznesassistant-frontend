import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import toast from 'react-hot-toast';
import api from '../api/axios';

const EmailVerification: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get token from URL query parameters
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    
    if (!token) {
      setError('Verification token is required');
      setLoading(false);
      return;
    }

    verifyEmail(token);
  }, [location.search]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await api.get(`/api/email/verify?token=${token}`);
      
      if (response.data.success) {
        setVerified(true);
        toast.success(response.data.message);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.data.message);
      }
    } catch (error: any) {
      setError(error.response?.data?.detail || t('emailVerification.verificationFailed'));
      toast.error(t('emailVerification.verificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    const email = prompt(t('emailVerification.enterEmail'));
    if (!email) return;

    try {
      const response = await api.post('/api/email/resend-verification', { email });
      
      if (response.data.success) {
        toast.success(t('emailVerification.verificationEmailSent'));
      } else {
        toast.error(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || t('emailVerification.failedToResend'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="mt-4 text-lg font-medium text-gray-900">
              {t('emailVerification.verifyingEmail')}
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (verified) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                {t('emailVerification.emailVerified')}
              </h2>
              <p className="mt-2 text-gray-600">
                {t('emailVerification.verificationSuccess')}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t('emailVerification.goToLogin')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              {t('emailVerification.verificationFailedTitle')}
            </h2>
            <p className="mt-2 text-gray-600">
              {error || t('emailVerification.verificationFailedMessage')}
            </p>
            
            <div className="mt-6 space-y-3">
              <button
                onClick={handleResendEmail}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('emailVerification.resendVerificationEmail')}
              </button>
              
              <button
                onClick={() => navigate('/login')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t('emailVerification.backToLogin')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
