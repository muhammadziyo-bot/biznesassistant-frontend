import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success(t('auth.loginPage.success'));
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || t('auth.loginPage.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.loginPage.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.loginPage.subtitle')}{' '}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {t('auth.loginPage.createAccount')}
            </Link>
            {' '}{t('auth.loginPage.subtitle')}{' '}
            <Link
              to="/business-registration"
              className="font-medium text-green-600 hover:text-green-500"
            >
              {t('auth.loginPage.registerBusiness')}
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="label">
                {t('auth.loginPage.emailAddress')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mt-4">
              <label htmlFor="password" className="label">
                {t('auth.loginPage.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? t('auth.loginPage.signingIn') : t('auth.loginPage.signIn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
