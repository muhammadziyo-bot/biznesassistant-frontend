import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface BusinessRegistrationData {
  business_name: string;
  tax_id: string;
  business_email: string;
  business_phone: string;
  business_address: string;
  industry: string;
  employee_count: string;
  admin_name: string;
  admin_email: string;
  admin_password: string;
  admin_phone: string;
  subscription_tier: string;
}

const BusinessRegistration: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { registerBusiness } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BusinessRegistrationData>({
    business_name: '',
    tax_id: '',
    business_email: '',
    business_phone: '',
    business_address: '',
    industry: '',
    employee_count: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
    admin_phone: '',
    subscription_tier: 'freemium'
  });

  const [errors, setErrors] = useState<Partial<BusinessRegistrationData>>({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);

  const industries = [
    'Retail', 'Manufacturing', 'Services', 'Technology', 'Healthcare',
    'Education', 'Construction', 'Transportation', 'Agriculture', 'Other'
  ];

  const employeeCounts = [
    '1-10', '11-50', '51-200', '201-500', '500+'
  ];

  const subscriptionTiers = [
    { 
      value: 'freemium', 
      name: 'Bepul (Free)', 
      price: '0 UZS', 
      description: '30 ta tranzaksiya, 15 ta invoice, 25 ta vazifa oyiga' 
    },
    { 
      value: 'professional', 
      name: 'Professional', 
      price: '60,000 UZS/oy', 
      description: 'Cheksiz tranzaksiyalar, kengaytirilgan hisobotlar' 
    },
    { 
      value: 'enterprise', 
      name: 'Enterprise', 
      price: '120,000 UZS/oy', 
      description: 'Jamoa hamkorligi, API kirish, analitika' 
    },
    { 
      value: 'premium', 
      name: 'Premium', 
      price: '200,000 UZS/oy', 
      description: 'Maxsus xususiyatlar, shaxsiy yordam, oq yorliq' 
    }
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<BusinessRegistrationData> = {};

    if (!formData.business_name.trim()) newErrors.business_name = 'Business name is required';
    if (!formData.tax_id.trim()) newErrors.tax_id = 'Tax ID is required';
    if (!formData.business_email.trim()) newErrors.business_email = 'Business email is required';
    if (!formData.admin_name.trim()) newErrors.admin_name = 'Admin name is required';
    if (!formData.admin_email.trim()) newErrors.admin_email = 'Admin email is required';
    if (!formData.admin_password.trim()) newErrors.admin_password = 'Password is required';
    if (formData.admin_password.length < 6) newErrors.admin_password = 'Password must be at least 6 characters';

    if (formData.business_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.business_email)) {
      newErrors.business_email = 'Invalid email format';
    }
    if (formData.admin_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.admin_email)) {
      newErrors.admin_email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await registerBusiness(formData);
      setRegistrationData(result);
      setRegistrationSuccess(true);
      toast.success('Biznesingiz muvaffaqiyatli ro\'yxatdan o\'tkazildi!');
    } catch (error: any) {
      toast.error(error.message || 'Ro\'yxatdan o\'tish amalga oshmadi');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name as keyof BusinessRegistrationData]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Show success screen with company code
  if (registrationSuccess && registrationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
          <div className="bg-white py-12 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <div className="mb-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Biznesingiz muvaffaqiyatli ro'yxatdan o'tkazildi!
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                30 kunlik bepul sinov muddatini boshlang
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Sizning Biznes Kodingiz
              </h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {registrationData.company_code}
              </div>
              <p className="text-sm text-blue-700">
                Bu kodni jamoangizga ulanish uchun ishlatingiz
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Qanday boshlash kerak
              </h3>
              <ol className="text-left space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm mr-3">1</span>
                  <span>Email manzilingizni tasdiqlang</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm mr-3">2</span>
                  <span>Tizimga kiring</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm mr-3">3</span>
                  <span>Biznesingizni boshqarishni boshlang</span>
                </li>
              </ol>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Tizimga Kirish
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Biznesingizni Ro'yxatdan O'tkazing
            </h2>
            <p className="mt-2 text-gray-600">
              30 kunlik bepul sinov muddatini boshlang
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Business Information */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('registration.business.info', 'Business Information')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('registration.business.name', 'Business Name')} *
                  </label>
                  <input
                    type="text"
                    name="business_name"
                    value={formData.business_name}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
                      errors.business_name ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.business_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.business_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('registration.business.taxId', 'Tax ID (INN)')} *
                  </label>
                  <input
                    type="text"
                    name="tax_id"
                    value={formData.tax_id}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
                      errors.tax_id ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.tax_id && (
                    <p className="text-red-500 text-xs mt-1">{errors.tax_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('registration.business.email', 'Business Email')} *
                  </label>
                  <input
                    type="email"
                    name="business_email"
                    value={formData.business_email}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
                      errors.business_email ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.business_email && (
                    <p className="text-red-500 text-xs mt-1">{errors.business_email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('registration.business.phone', 'Business Phone')}
                  </label>
                  <input
                    type="tel"
                    name="business_phone"
                    value={formData.business_phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('registration.business.address', 'Business Address')}
                  </label>
                  <textarea
                    name="business_address"
                    value={formData.business_address}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('registration.business.industry', 'Industry')}
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  >
                    <option value="">Select industry</option>
                    {industries.map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('registration.business.employees', 'Number of Employees')}
                  </label>
                  <select
                    name="employee_count"
                    value={formData.employee_count}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  >
                    <option value="">Select size</option>
                    {employeeCounts.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Admin User Information */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('registration.business.admin', 'Admin User Information')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('registration.business.adminName', 'Admin Name')} *
                  </label>
                  <input
                    type="text"
                    name="admin_name"
                    value={formData.admin_name}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
                      errors.admin_name ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.admin_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.admin_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('registration.business.adminEmail', 'Admin Email')} *
                  </label>
                  <input
                    type="email"
                    name="admin_email"
                    value={formData.admin_email}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
                      errors.admin_email ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.admin_email && (
                    <p className="text-red-500 text-xs mt-1">{errors.admin_email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('registration.business.adminPassword', 'Admin Password')} *
                  </label>
                  <input
                    type="password"
                    name="admin_password"
                    value={formData.admin_password}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border ${
                      errors.admin_password ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.admin_password && (
                    <p className="text-red-500 text-xs mt-1">{errors.admin_password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('registration.business.adminPhone', 'Admin Phone')}
                  </label>
                  <input
                    type="tel"
                    name="admin_phone"
                    value={formData.admin_phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  />
                </div>
              </div>
            </div>

            {/* Subscription Tier */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('registration.business.subscriptionPlan', 'Choose Your Plan')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {subscriptionTiers.map(tier => (
                  <div
                    key={tier.value}
                    className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
                      formData.subscription_tier === tier.value
                        ? 'border-blue-500 ring-2 ring-blue-500'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setFormData({ ...formData, subscription_tier: tier.value })}
                  >
                    <div className="text-center">
                      <h4 className="text-lg font-semibold text-gray-900">{tier.name}</h4>
                      <p className="text-2xl font-bold text-blue-600 mt-2">{tier.price}</p>
                      <p className="text-sm text-gray-600 mt-2">{tier.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-gray-200 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V8C8 8.5 9.5 8 12 8s4 .5 4 2v4a8 8 0 01-8 8z"></path>
                    </svg>
                    Ro'yxatdan o'tilmoqda...
                  </span>
                ) : (
                  <span>Biznesni Ro'yxatdan O'tkazish</span>
                )}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {t('registration.business.haveAccount', 'Already have an account?')}{' '}
                <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  {t('auth.login', 'Sign in')}
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BusinessRegistration;
