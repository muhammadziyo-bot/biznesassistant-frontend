import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface UsageLimitBannerProps {
  onUpgrade?: () => void;
}

const UsageLimitBanner: React.FC<UsageLimitBannerProps> = ({ onUpgrade }) => {
  const { t } = useTranslation();
  const [usageStatus, setUsageStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkUsageLimits();
  }, []);

  const checkUsageLimits = async () => {
    try {
      const response = await api.get('/api/usage/current-usage');
      setUsageStatus(response.data);
    } catch (error) {
      console.error('Failed to check usage limits:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || dismissed || !usageStatus?.needs_upgrade) {
    return null;
  }

  const getWarningMessage = () => {
    const { can_create_transaction, can_create_invoice, can_create_task } = usageStatus;
    
    if (!can_create_transaction && !can_create_invoice && !can_create_task) {
      return t('usage.limits.allReached');
    } else if (!can_create_transaction) {
      return t('usage.limits.transactionsReached');
    } else if (!can_create_invoice) {
      return t('usage.limits.invoicesReached');
    } else if (!can_create_task) {
      return t('usage.limits.tasksReached');
    }
    
    return t('usage.limits.nearLimit');
  };

  const getUsagePercentage = () => {
    const { usage, limits } = usageStatus;
    const percentages = [];
    
    if (limits.transactions !== -1) {
      percentages.push((usage.transactions / limits.transactions) * 100);
    }
    if (limits.invoices !== -1) {
      percentages.push((usage.invoices / limits.invoices) * 100);
    }
    if (limits.tasks !== -1) {
      percentages.push((usage.tasks / limits.tasks) * 100);
    }
    
    return Math.max(...percentages);
  };

  const usagePercentage = getUsagePercentage();
  const isHighUsage = usagePercentage >= 80;

  return (
    <div className={`${
      isHighUsage ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
    } border rounded-lg p-4 mb-6`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <div className={`${
              isHighUsage ? 'text-red-600' : 'text-yellow-600'
            } mr-3`}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className={`text-sm font-medium ${
                isHighUsage ? 'text-red-800' : 'text-yellow-800'
              }`}>
                {isHighUsage ? t('usage.limits.limitReached') : t('usage.limits.nearLimit')}
              </h3>
              <p className={`text-sm ${
                isHighUsage ? 'text-red-700' : 'text-yellow-700'
              } mt-1`}>
                {getWarningMessage()}
              </p>
            </div>
          </div>
          
          {/* Usage Progress */}
          <div className="mt-3 space-y-2">
            {usageStatus.limits.transactions !== -1 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">{t('usage.transactions')}: {usageStatus.usage.transactions}/{usageStatus.limits.transactions}</span>
                <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((usageStatus.usage.transactions / usageStatus.limits.transactions) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
            {usageStatus.limits.invoices !== -1 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">{t('usage.invoices')}: {usageStatus.usage.invoices}/{usageStatus.limits.invoices}</span>
                <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((usageStatus.usage.invoices / usageStatus.limits.invoices) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
            {usageStatus.limits.tasks !== -1 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">{t('usage.tasks')}: {usageStatus.usage.tasks}/{usageStatus.limits.tasks}</span>
                <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((usageStatus.usage.tasks / usageStatus.limits.tasks) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={onUpgrade}
            className={`${
              isHighUsage 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            } px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
          >
            {t('usage.upgrade')}
          </button>
        </div>
      </div>
      
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default UsageLimitBanner;
