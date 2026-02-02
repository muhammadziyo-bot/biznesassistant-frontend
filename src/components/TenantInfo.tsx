import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';

const TenantInfo: React.FC = () => {
  const { tenant, user } = useAuth();
  const { t } = useTranslation();

  if (!tenant || !user) return null;

  // Test subscription translations with fallbacks
  const subscriptionTranslations = {
    taxId: t('subscription.taxId', 'Tax ID'),
    plan: t('subscription.plan', 'Plan'),
    status: t('subscription.status', 'Status'),
    loggedInAs: t('subscription.loggedInAs', 'Logged in as'),
    trialExpired: t('subscription.trialExpired', 'Trial Expired')
  };

  const getTrialDaysRemaining = () => {
    if (!tenant.trial_ends_at) return null;
    const trialEnd = new Date(tenant.trial_ends_at);
    const today = new Date();
    const diffTime = trialEnd.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const trialDaysRemaining = getTrialDaysRemaining();

  const getSubscriptionColor = () => {
    if (tenant.subscription_status === 'trial') {
      return trialDaysRemaining && trialDaysRemaining <= 7 ? 'text-orange-600' : 'text-green-600';
    }
    return tenant.subscription_status === 'active' ? 'text-green-600' : 'text-red-600';
  };

  const getSubscriptionText = () => {
    if (tenant.subscription_status === 'trial') {
      return trialDaysRemaining ? `${trialDaysRemaining} ${t('subscription.trialDaysLeft', 'days left')}` : subscriptionTranslations.trialExpired;
    }
    return tenant.subscription_status === 'active' ? t('subscription.active', 'Active') : t('subscription.expired', 'Expired');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {tenant.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{tenant.name}</h3>
            <p className="text-sm text-gray-500">{subscriptionTranslations.taxId}: {tenant.tax_id}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{subscriptionTranslations.plan}:</span>
            <span className="text-sm font-medium text-gray-900 capitalize">
              {tenant.subscription_tier}
            </span>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-sm text-gray-500">{subscriptionTranslations.status}:</span>
            <span className={`text-sm font-medium ${getSubscriptionColor()}`}>
              {getSubscriptionText()}
            </span>
          </div>
        </div>
      </div>

      {tenant.subscription_status === 'trial' && trialDaysRemaining && trialDaysRemaining <= 7 && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">
                {t('subscription.trialEndingSoon')}
              </h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>{t('subscription.trialEndsInDays').replace('{0}', trialDaysRemaining.toString())}</p>
                <button className="mt-2 text-sm font-medium text-orange-600 underline hover:text-orange-800">
                  {t('subscription.upgradeYourPlan')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{subscriptionTranslations.loggedInAs}: {user.full_name}</span>
          <span className="capitalize">{user.role}</span>
        </div>
      </div>
    </div>
  );
};

export default TenantInfo;
