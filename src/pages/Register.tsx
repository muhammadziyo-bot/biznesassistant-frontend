import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    full_name: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Password requirements state
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    digit: false,
  });

  const validatePassword = (password: string) => {
    setPasswordRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      digit: /\d/.test(password),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Validate password on change
    if (name === 'password') {
      validatePassword(value);
    }
  };

  const isPasswordValid = () => {
    return passwordRequirements.length && 
           passwordRequirements.uppercase && 
           passwordRequirements.lowercase && 
           passwordRequirements.digit;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    // Check password requirements before submission
    if (!isPasswordValid()) {
      toast.error('Please meet all password requirements');
      return;
    }
    
    setLoading(true);

    try {
      await register(formData);
      toast.success('Account created successfully! Please login to continue.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center text-sm ${met ? 'text-green-600' : 'text-red-600'}`}>
      <span className="mr-2">{met ? '✓' : '✗'}</span>
      {text}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="full_name" className="label">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                className="input"
                value={formData.full_name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="username" className="label">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="input"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="phone" className="label">
                Phone (optional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="input"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={`input ${formData.password && !isPasswordValid() ? 'border-red-500' : ''}`}
                value={formData.password}
                onChange={handleChange}
              />
              
              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-2 space-y-1 bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Password must contain:</p>
                  <PasswordRequirement 
                    met={passwordRequirements.length} 
                    text="At least 8 characters" 
                  />
                  <PasswordRequirement 
                    met={passwordRequirements.uppercase} 
                    text="One uppercase letter (A-Z)" 
                  />
                  <PasswordRequirement 
                    met={passwordRequirements.lowercase} 
                    text="One lowercase letter (a-z)" 
                  />
                  <PasswordRequirement 
                    met={passwordRequirements.digit} 
                    text="One number (0-9)" 
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !isPasswordValid()}
              className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
