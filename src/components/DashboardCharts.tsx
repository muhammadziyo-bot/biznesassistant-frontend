import React, { ReactNode } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface ChartCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon?: any;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, value, change, changeType, icon }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-xs sm:text-sm mt-2 ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-2 sm:p-3 bg-blue-50 rounded-lg ml-3">
            <div className="w-5 h-5 sm:w-6 sm:h-6">
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface MiniChartProps {
  data: number[];
  color: string;
}

const MiniChart: React.FC<MiniChartProps> = ({ data, color }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className="flex items-end space-x-1 h-16">
      {data.map((value, index) => (
        <div
          key={index}
          className="flex-1 rounded-t"
          style={{
            height: `${((value - min) / range) * 100}%`,
            backgroundColor: color,
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  );
};

const DashboardCharts: React.FC = () => {
  const { t } = useTranslation();

  // Sample data - in real app, this would come from API
  const revenueData = [45, 52, 38, 65, 48, 72, 68, 75, 82, 79, 88, 92];
  const expenseData = [32, 28, 35, 42, 38, 45, 41, 48, 52, 49, 55, 58];
  const taskData = [12, 15, 8, 18, 14, 22, 19, 25, 28, 24, 30, 32];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <ChartCard
          title={t('dashboard.kpi.totalRevenue')}
          value="UZS 45.2M"
          change="+12.5%"
          changeType="positive"
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <ChartCard
          title={t('dashboard.kpi.activeTasks')}
          value="24"
          change="+8%"
          changeType="positive"
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />
        <ChartCard
          title={t('dashboard.kpi.totalCustomers')}
          value="156"
          change="+15%"
          changeType="positive"
          icon={
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <ChartCard
          title={t('dashboard.kpi.conversionRate')}
          value="3.2%"
          change="-0.5%"
          changeType="negative"
          icon={
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Revenue vs Expenses Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.charts.revenueVsExpenses')}</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">{t('dashboard.charts.revenue')}</span>
                <span className="font-medium">UZS 45.2M</span>
              </div>
              <MiniChart data={revenueData} color="#3B82F6" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">{t('dashboard.charts.expenses')}</span>
                <span className="font-medium">UZS 28.7M</span>
              </div>
              <MiniChart data={expenseData} color="#EF4444" />
            </div>
          </div>
        </div>

        {/* Task Completion Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.charts.taskCompletion')}</h3>
          <div className="space-y-4">
            <MiniChart data={taskData} color="#10B981" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">32</p>
                <p className="text-sm text-gray-600">{t('dashboard.charts.completed')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">24</p>
                <p className="text-sm text-gray-600">{t('dashboard.charts.inProgress')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-400">8</p>
                <p className="text-sm text-gray-600">{t('dashboard.charts.pending')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.recentActivity.title')}</h3>
        <div className="space-y-4">
          {[
            { user: "Ali Karimov", action: t('dashboard.recentActivity.taskCompleted'), time: t('dashboard.recentActivity.timeAgo.twoHoursAgo'), type: "task" },
            { user: "Dilnoza Rahimova", action: t('dashboard.recentActivity.invoiceCreated'), time: t('dashboard.recentActivity.timeAgo.threeHoursAgo'), type: "invoice" },
            { user: "Botir Alimov", action: t('dashboard.recentActivity.customerAdded'), time: t('dashboard.recentActivity.timeAgo.fiveHoursAgo'), type: "customer" },
            { user: "Gulnara Tashmatova", action: t('dashboard.recentActivity.expenseAdded'), time: t('dashboard.recentActivity.timeAgo.oneDayAgo'), type: "expense" },
          ].map((activity, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-100 last:border-0 space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  activity.type === 'task' ? 'bg-green-500' :
                  activity.type === 'invoice' ? 'bg-blue-500' :
                  activity.type === 'customer' ? 'bg-purple-500' : 'bg-orange-500'
                }`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.user}</p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500 flex-shrink-0">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
