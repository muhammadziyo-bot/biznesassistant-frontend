import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import DashboardCharts from '../components/DashboardCharts';
import EnhancedDashboardCharts from '../components/EnhancedDashboardCharts';
import RoleBasedDashboard from '../components/RoleBasedDashboard';
import TenantInfo from '../components/TenantInfo';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'basic' | 'enhanced' | 'role-based'>('enhanced');

  return (
    <div className="space-y-6">
      {/* Tenant Information */}
      <TenantInfo />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          <p className="text-gray-600">{t('dashboard.subtitle')}</p>
        </div>
        
        {/* View mode selector */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode('basic')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'basic'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('dashboard.views.basic')}
          </button>
          <button
            onClick={() => setViewMode('enhanced')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'enhanced'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('dashboard.views.enhanced')}
          </button>
          <button
            onClick={() => setViewMode('role-based')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'role-based'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('dashboard.views.roleBased')}
          </button>
        </div>
      </div>

      {/* Dashboard Content based on view mode */}
      {viewMode === 'basic' && <DashboardCharts />}
      {viewMode === 'enhanced' && <EnhancedDashboardCharts />}
      {viewMode === 'role-based' && <RoleBasedDashboard />}
    </div>
  );
};

export default Dashboard;
