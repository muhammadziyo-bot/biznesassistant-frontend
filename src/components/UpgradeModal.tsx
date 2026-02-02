import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import api from '../api/axios';
import toast from 'react-hot-toast';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, currentPlan = 'freemium' }) => {
  const { t } = useTranslation();
  const [tiers, setTiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>('professional');
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSubscriptionTiers();
    }
  }, [isOpen]);

  const fetchSubscriptionTiers = async () => {
    try {
      const response = await api.get('/api/registration/subscription-tiers');
      const tiersData = Object.entries(response.data.tiers)
        .filter(([key]) => key !== 'freemium')
        .map(([key, value]: [string, any]) => ({
          id: key,
          ...value
        }));
      setTiers(tiersData);
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      // Here you would integrate with payment processor
      // For now, we'll just show a success message
      toast.success(t('usage.upgradeSuccess'));
      onClose();
    } catch (error) {
      toast.error(t('usage.upgradeError'));
    } finally {
      setUpgrading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('usage.upgradePlan')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`border rounded-lg p-6 cursor-pointer transition-all ${
                  selectedPlan === tier.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPlan(tier.id)}
              >
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{tier.name}</h3>
                  <div className="text-2xl font-bold text-gray-900 mb-4">{tier.price}</div>
                  <p className="text-sm text-gray-600 mb-6">{tier.duration}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan(tier.id);
                    handleUpgrade();
                  }}
                  disabled={upgrading}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    selectedPlan === tier.id
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${upgrading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {upgrading ? t('common.processing') : t('usage.selectPlan')}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('usage.upgradeNote')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
