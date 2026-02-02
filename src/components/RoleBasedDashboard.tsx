import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
// @ts-expect-error react-query types issue
import { useQuery } from 'react-query';
import axios from 'axios';

interface RoleBasedData {
  role: string;
  widgets: string[];
  permissions: Record<string, boolean>;
  kpis: Array<{
    id: number;
    category: string;
    value: number;
    previous_value: number;
    growth_percentage?: number;
  }>;
}

interface WidgetProps {
  type: string;
  data: any;
  permissions: Record<string, boolean>;
}

const AdminWidget: React.FC<{ data: any }> = ({ data }) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.widgets.adminOverview')}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{data.totalUsers || 0}</p>
          <p className="text-sm text-gray-600">{t('dashboard.widgets.totalUsers')}</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{data.activeUsers || 0}</p>
          <p className="text-sm text-gray-600">{t('dashboard.widgets.activeUsers')}</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <p className="text-2xl font-bold text-purple-600">{data.systemHealth || 'Good'}</p>
          <p className="text-sm text-gray-600">{t('dashboard.widgets.systemHealth')}</p>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <p className="text-2xl font-bold text-orange-600">{data.pendingTasks || 0}</p>
          <p className="text-sm text-gray-600">{t('dashboard.widgets.pendingTasks')}</p>
        </div>
      </div>
    </div>
  );
};

const AccountantWidget: React.FC<{ data: any }> = ({ data }) => {
  const { t } = useTranslation();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.widgets.financialSummary')}</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">{t('dashboard.widgets.totalRevenue')}</span>
          <span className="text-lg font-bold text-green-600">{formatCurrency(data.totalRevenue || 0)}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">{t('dashboard.widgets.totalExpenses')}</span>
          <span className="text-lg font-bold text-red-600">{formatCurrency(data.totalExpenses || 0)}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">{t('dashboard.widgets.netProfit')}</span>
          <span className="text-lg font-bold text-blue-600">{formatCurrency(data.netProfit || 0)}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">{t('dashboard.widgets.taxOwed')}</span>
          <span className="text-lg font-bold text-orange-600">{formatCurrency(data.taxOwed || 0)}</span>
        </div>
      </div>
    </div>
  );
};

const ManagerWidget: React.FC<{ data: any }> = ({ data }) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.widgets.teamPerformance')}</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{data.teamMembers || 0}</p>
            <p className="text-sm text-gray-600">{t('dashboard.widgets.teamMembers')}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{data.tasksCompleted || 0}</p>
            <p className="text-sm text-gray-600">{t('dashboard.widgets.tasksCompleted')}</p>
          </div>
        </div>
        
        {/* Team performance list */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">{t('dashboard.widgets.topPerformers')}</h4>
          <div className="space-y-2">
            {(data.topPerformers || []).map((performer: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">{performer.name}</span>
                <span className="text-sm text-gray-600">{performer.tasks} {t('dashboard.widgets.tasks')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskManagementWidget: React.FC<{ data: any; permissions: Record<string, boolean> }> = ({ data, permissions }) => {
  const { t } = useTranslation();
  
  if (!permissions.manage_tasks) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-gray-500">
          <p>{t('dashboard.widgets.noPermission')}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.widgets.taskManagement')}</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
          <span className="text-sm font-medium text-red-700">{t('dashboard.widgets.overdueTasks')}</span>
          <span className="text-lg font-bold text-red-600">{data.overdueTasks || 0}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
          <span className="text-sm font-medium text-yellow-700">{t('dashboard.widgets.pendingTasks')}</span>
          <span className="text-lg font-bold text-yellow-600">{data.pendingTasks || 0}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
          <span className="text-sm font-medium text-green-700">{t('dashboard.widgets.completedTasks')}</span>
          <span className="text-lg font-bold text-green-600">{data.completedTasks || 0}</span>
        </div>
      </div>
    </div>
  );
};

const CustomerAnalyticsWidget: React.FC<{ data: any }> = ({ data }) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.widgets.customerAnalytics')}</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{data.totalCustomers || 0}</p>
            <p className="text-sm text-gray-600">{t('dashboard.widgets.totalCustomers')}</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{data.newCustomers || 0}</p>
            <p className="text-sm text-gray-600">{t('dashboard.widgets.newCustomers')}</p>
          </div>
        </div>
        
        {/* Customer segments */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">{t('dashboard.widgets.customerSegments')}</h4>
          <div className="space-y-2">
            {(data.segments || []).map((segment: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{segment.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${segment.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-700">{segment.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Widget: React.FC<WidgetProps> = ({ type, data, permissions }) => {
  switch (type) {
    case 'revenue_chart':
    case 'expense_chart':
    case 'profit_chart':
      return <AccountantWidget data={data} />;
    case 'team_performance':
    case 'lead_conversion':
      return <ManagerWidget data={data} />;
    case 'kpi_summary':
    case 'invoice_summary':
    case 'tax_calculations':
      return <AccountantWidget data={data} />;
    case 'customer_chart':
      return <CustomerAnalyticsWidget data={data} />;
    case 'task_summary':
      return <TaskManagementWidget data={data} permissions={permissions} />;
    default:
      return <div className="bg-white rounded-lg shadow-sm border p-6">
        <p className="text-gray-500">{`Widget ${type} not implemented`}</p>
      </div>;
  }
};

const RoleBasedDashboard: React.FC = () => {
  const { t } = useTranslation();
  
  // Fetch role-based dashboard data
  const { data: dashboardData, isLoading } = useQuery(
    'role-based-dashboard',
    async () => {
      const response = await axios.get('/api/analytics/dashboard/role-based', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center text-gray-500">
        <p>{t('dashboard.loadingError')}</p>
      </div>
    );
  }

  // Use real widget data from API
  const widgetData = dashboardData.widget_data || {};

  return (
    <div className="space-y-6">
      {/* Role indicator */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {t('dashboard.roleBased.title')}
          </h2>
          <p className="text-gray-600">
            {t('dashboard.roleBased.currentRole')}: <span className="font-medium capitalize">{dashboardData.role}</span>
          </p>
        </div>
        
        {/* Permissions indicator */}
        <div className="flex space-x-2">
          {Object.entries(dashboardData.permissions).map(([permission, hasPermission]) => (
            <span
              key={permission}
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                hasPermission 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {t(`dashboard.permissions.${permission}`)}
            </span>
          ))}
        </div>
      </div>

      {/* Role-specific widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {dashboardData.widgets.map((widgetType: string, index: number) => (
          <Widget
            key={index}
            type={widgetType}
            data={widgetData[widgetType] || {}}
            permissions={dashboardData.permissions}
          />
        ))}
      </div>

      {/* KPI Summary for this role */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('dashboard.roleBased.relevantKPIs')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardData.kpis.map((kpi) => (
            <div key={kpi.id} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600 capitalize">
                {t(`dashboard.kpi.${kpi.category}`)}
              </p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {kpi.category === 'revenue' || kpi.category === 'expenses' || kpi.category === 'profit'
                  ? new Intl.NumberFormat('uz-UZ', {
                      style: 'currency',
                      currency: 'UZS',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(kpi.value)
                  : new Intl.NumberFormat('uz-UZ').format(kpi.value)
                }
              </p>
              {kpi.previous_value > 0 && (
                <p className={`text-sm mt-1 ${
                  kpi.value > kpi.previous_value ? 'text-green-600' : 
                  kpi.value < kpi.previous_value ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {kpi.value > kpi.previous_value ? '+' : ''}
                  {((kpi.value - kpi.previous_value) / kpi.previous_value * 100).toFixed(1)}%
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleBasedDashboard;
