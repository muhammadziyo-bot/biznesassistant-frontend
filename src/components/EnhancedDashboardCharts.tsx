import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
// @ts-ignore
import { useQuery } from 'react-query';
import api from '../api/axios';

interface KPIData {
  id: number;
  category: string;
  period: string;
  value: number;
  previous_value: number;
  target_value?: number;
  date: string;
  growth_percentage?: number;
}

interface TrendData {
  date: string;
  value: number;
  forecast?: boolean;
}

interface ForecastData {
  kpi_category: string;
  period_type: string;
  historical_data: TrendData[];
  forecast_data: TrendData[];
  confidence_score: number;
  model_used: string;
}

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: any;
  trend?: TrendData[];
  category?: string;
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  trend, 
  category 
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendColor = () => {
    switch (changeType) {
      case 'positive': return '#10B981';
      case 'negative': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-2 ${getChangeColor()}`}>
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-blue-50 rounded-lg ml-4">
            {icon}
          </div>
        )}
      </div>
      
      {/* Mini trend chart */}
      {trend && trend.length > 0 && (
        <div className="mt-4">
          <div className="flex items-end space-x-1 h-12">
            {trend.slice(-12).map((point, index) => (
              <div
                key={index}
                className="flex-1 rounded-t"
                style={{
                  height: `${(point.value / Math.max(...trend.map(t => t.value))) * 100}%`,
                  backgroundColor: point.forecast ? getTrendColor() + '40' : getTrendColor(),
                  opacity: point.forecast ? 0.6 : 0.8,
                }}
                title={`${point.date}: ${point.value.toFixed(2)}`}
              />
            ))}
          </div>
          {category && (
            <p className="text-xs text-gray-500 mt-2">
              {category} trend
            </p>
          )}
        </div>
      )}
    </div>
  );
};

interface TrendChartProps {
  data: TrendData[];
  title: string;
  color?: string;
  showForecast?: boolean;
}

const TrendChart: React.FC<TrendChartProps> = ({ 
  data, 
  title, 
  color = '#3B82F6', 
  showForecast = false 
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
          <span>{maxValue.toFixed(0)}</span>
          <span>{((maxValue + minValue) / 2).toFixed(0)}</span>
          <span>{minValue.toFixed(0)}</span>
        </div>
        
        {/* Chart area */}
        <div className="ml-16 h-full flex items-end space-x-2">
          {data.map((point, index) => (
            <div
              key={index}
              className="flex-1 relative group"
              style={{ height: '100%' }}
            >
              <div
                className={`absolute bottom-0 w-full rounded-t transition-all hover:opacity-80 ${
                  point.forecast ? 'opacity-40' : ''
                }`}
                style={{
                  height: `${((point.value - minValue) / range) * 100}%`,
                  backgroundColor: point.forecast ? color + '40' : color,
                }}
              />
              
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {point.date}: {point.value.toFixed(2)}
                {point.forecast && ' (forecast)'}
              </div>
            </div>
          ))}
        </div>
        
        {/* Forecast divider */}
        {showForecast && data.some(d => d.forecast) && (
          <div className="absolute left-16 right-0 border-t-2 border-dashed border-gray-400" 
               style={{ bottom: '20%' }}>
            <span className="absolute -top-3 left-0 text-xs text-gray-500 bg-white px-1">Forecast</span>
          </div>
        )}
      </div>
      
      {/* X-axis labels */}
      <div className="ml-16 mt-2 flex justify-between text-xs text-gray-500">
        {data.filter((_, index) => index % Math.ceil(data.length / 6) === 0).map((point, index) => (
          <span key={index}>{new Date(point.date).toLocaleDateString('en-US', { month: 'short' })}</span>
        ))}
      </div>
    </div>
  );
};

const EnhancedDashboardCharts: React.FC = () => {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedCategory, setSelectedCategory] = useState('revenue');

  // Fetch KPIs
  const { data: kpisData, isLoading: kpisLoading } = useQuery(
    ['kpis', selectedPeriod],
    async () => {
      const response = await api.get(`/api/analytics/kpis?period=${selectedPeriod}`);
      return response.data;
    }
  );

  // Fetch trend data for selected category
  const { data: trendData, isLoading: trendLoading } = useQuery(
    ['kpi-trend', selectedCategory, selectedPeriod],
    async () => {
      const response = await api.get(
        `/api/analytics/kpi/trend/${selectedCategory}?period_type=${selectedPeriod}&months=12`
      );
      return response.data;
    }
  );

  // Fetch forecast data
  const { data: forecastData } = useQuery(
    ['kpi-forecast', selectedCategory, selectedPeriod],
    async () => {
      try {
        const response = await api.post(
          '/api/analytics/kpi/forecast',
          {
            kpi_category: selectedCategory,
            period_type: selectedPeriod,
            forecast_periods: 3
          }
        );
        return response.data;
      } catch (error) {
        console.warn('Forecast not available:', error);
        return null;
      }
    }
  );

  // Fetch analytics summary
  const { data: summaryData } = useQuery(
    'analytics-summary',
    async () => {
      try {
        const response = await api.get('/api/analytics/summary');
        return response.data;
      } catch (error) {
        console.warn('Analytics summary not available:', error);
        return null;
      }
    }
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('uz-UZ').format(value);
  };

  const getKPIIcon = (category: string) => {
    const iconClass = "w-6 h-6";
    switch (category) {
      case 'revenue':
        return (
          <svg className={`${iconClass} text-blue-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'expenses':
        return (
          <svg className={`${iconClass} text-red-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'profit':
        return (
          <svg className={`${iconClass} text-green-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'customers':
        return (
          <svg className={`${iconClass} text-purple-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.0 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'invoices':
        return (
          <svg className={`${iconClass} text-orange-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className={`${iconClass} text-gray-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
    }
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (kpisLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.enhanced.title')}</h2>
        <div className="flex space-x-2">
          {['daily', 'weekly', 'monthly', 'quarterly'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t(`dashboard.periods.${period}`)}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpisData?.map((kpi: KPIData) => {
          const growth = calculateGrowth(kpi.value, kpi.previous_value);
          const changeType = growth > 5 ? 'positive' : growth < -5 ? 'negative' : 'neutral';
          
          return (
            <KPICard
              key={kpi.id}
              title={t(`dashboard.kpi.${kpi.category}`)}
              value={
                kpi.category === 'revenue' || kpi.category === 'expenses' || kpi.category === 'profit'
                  ? formatCurrency(kpi.value)
                  : formatNumber(kpi.value)
              }
              change={`${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`}
              changeType={changeType}
              icon={getKPIIcon(kpi.category)}
              trend={trendData?.trend_data}
              category={kpi.category}
            />
          );
        })}
      </div>

      {/* Category selector for detailed charts */}
      <div className="flex space-x-2">
        {['revenue', 'expenses', 'profit', 'customers', 'invoices', 'leads', 'deals'].map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t(`dashboard.categories.${category}`)}
          </button>
        ))}
      </div>

      {/* Trend and Forecast Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historical Trend */}
        <TrendChart
          data={trendData?.trend_data || []}
          title={`${t(`dashboard.categories.${selectedCategory}`)} ${t('dashboard.charts.trend')}`}
          color={selectedCategory === 'revenue' ? '#10B981' : selectedCategory === 'expenses' ? '#EF4444' : '#3B82F6'}
        />

        {/* Forecast */}
        {forecastData && (
          <TrendChart
            data={[
              ...forecastData.historical_data,
              ...forecastData.forecast_data
            ]}
            title={`${t(`dashboard.categories.${selectedCategory}`)} ${t('dashboard.charts.forecast')}`}
            color={selectedCategory === 'revenue' ? '#10B981' : selectedCategory === 'expenses' ? '#EF4444' : '#3B82F6'}
            showForecast={true}
          />
        )}
      </div>

      {/* Insights Summary */}
      {summaryData && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.insights.title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {summaryData.insights.revenue_growth > 0 ? '+' : ''}{summaryData.insights.revenue_growth}%
              </p>
              <p className="text-sm text-gray-600">{t('dashboard.insights.revenueGrowth')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{summaryData.insights.profit_margin}%</p>
              <p className="text-sm text-gray-600">{t('dashboard.insights.profitMargin')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 capitalize">{summaryData.insights.trend_direction}</p>
              <p className="text-sm text-gray-600">{t('dashboard.insights.trendDirection')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedDashboardCharts;
