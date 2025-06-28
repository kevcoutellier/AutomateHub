import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  DollarSign, 
  Users, 
  Clock, 
  Target, 
  Star,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CheckCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { analyticsApi, AnalyticsData } from '../../services/analyticsApi';

interface MetricCard {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
}

export const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [viewType, setViewType] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await analyticsApi.getAnalyticsData(timeRange);
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please check your connection and try again.');
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  const platformMetrics: MetricCard[] = analyticsData ? [
    {
      title: 'Total Projects',
      value: analyticsData.platformMetrics.totalProjects.toLocaleString(),
      change: analyticsData.changes?.totalProjects ? `${analyticsData.changes.totalProjects > 0 ? '+' : ''}${analyticsData.changes.totalProjects}%` : '+0%',
      changeType: (analyticsData.changes?.totalProjects ?? 0) > 0 ? 'increase' : (analyticsData.changes?.totalProjects ?? 0) < 0 ? 'decrease' : 'neutral',
      icon: BarChart3,
      color: 'primary'
    },
    {
      title: 'Success Rate',
      value: `${analyticsData.platformMetrics.successRate}%`,
      change: analyticsData.changes?.successRate ? `${analyticsData.changes.successRate > 0 ? '+' : ''}${analyticsData.changes.successRate}%` : '+0%',
      changeType: (analyticsData.changes?.successRate ?? 0) > 0 ? 'increase' : (analyticsData.changes?.successRate ?? 0) < 0 ? 'decrease' : 'neutral',
      icon: CheckCircle,
      color: 'success'
    },
    {
      title: 'Avg Project Value',
      value: `$${analyticsData.platformMetrics.avgProjectValue.toLocaleString()}`,
      change: analyticsData.changes?.avgProjectValue ? `${analyticsData.changes.avgProjectValue > 0 ? '+' : ''}${analyticsData.changes.avgProjectValue}%` : '+0%',
      changeType: (analyticsData.changes?.avgProjectValue ?? 0) > 0 ? 'increase' : (analyticsData.changes?.avgProjectValue ?? 0) < 0 ? 'decrease' : 'neutral',
      icon: DollarSign,
      color: 'secondary'
    },
    {
      title: 'Client Satisfaction',
      value: `${analyticsData.platformMetrics.clientSatisfaction}/5.0`,
      change: analyticsData.changes?.clientSatisfaction ? `${analyticsData.changes.clientSatisfaction > 0 ? '+' : ''}${analyticsData.changes.clientSatisfaction}` : '+0',
      changeType: (analyticsData.changes?.clientSatisfaction ?? 0) > 0 ? 'increase' : (analyticsData.changes?.clientSatisfaction ?? 0) < 0 ? 'decrease' : 'neutral',
      icon: Star,
      color: 'warning'
    }
  ] : [];

  const expertMetrics: MetricCard[] = analyticsData ? [
    {
      title: 'Active Experts',
      value: analyticsData.expertMetrics.activeExperts.toString(),
      change: '+18',
      changeType: 'increase',
      icon: Users,
      color: 'primary'
    },
    {
      title: 'Avg Response Time',
      value: analyticsData.expertMetrics.avgResponseTime,
      change: '-0.5h',
      changeType: 'increase',
      icon: Clock,
      color: 'success'
    },
    {
      title: 'Expert Retention',
      value: `${analyticsData.expertMetrics.expertRetention}%`,
      change: '+3%',
      changeType: 'increase',
      icon: Target,
      color: 'secondary'
    },
    {
      title: 'Avg Rating',
      value: `${analyticsData.expertMetrics.avgRating}/5.0`,
      change: '+0.2',
      changeType: 'increase',
      icon: Star,
      color: 'warning'
    }
  ] : [];

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return ArrowUpRight;
      case 'decrease': return ArrowDownRight;
      default: return Activity;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase': return 'text-success-600';
      case 'decrease': return 'text-error-600';
      default: return 'text-gray-600';
    }
  };

  const getCardColor = (color: string) => {
    switch (color) {
      case 'primary': return 'bg-primary-100 text-primary-600';
      case 'success': return 'bg-success-100 text-success-600';
      case 'secondary': return 'bg-secondary-100 text-secondary-600';
      case 'warning': return 'bg-warning-100 text-warning-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error && !analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-error-600 mx-auto mb-4" />
          <p className="text-error-600 mb-4">{error}</p>
          <Button onClick={fetchAnalyticsData}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">Platform performance and business insights</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <Button variant="outline" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          {/* View Type Selector */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'platform', label: 'Platform' },
                { id: 'experts', label: 'Experts' }
              ].map((view) => (
                <button
                  key={view.id}
                  onClick={() => setViewType(view.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    viewType === view.id
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {(viewType === 'overview' || viewType === 'platform' ? platformMetrics : expertMetrics).map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getCardColor(metric.color)}`}>
                    <metric.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex items-center">
                  {React.createElement(getChangeIcon(metric.changeType), { 
                    className: `w-4 h-4 ${getChangeColor(metric.changeType)} mr-1` 
                  })}
                  <span className={`text-sm font-medium ${getChangeColor(metric.changeType)}`}>
                    {metric.change}
                  </span>
                  <span className="text-sm text-gray-600 ml-2">vs last period</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts and Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Revenue Trend</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Actual</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-600">Target</span>
                  </div>
                </div>
              </div>
              <div className="h-64 flex items-end justify-between gap-2">
                {analyticsData.revenueData.map((data) => (
                  <div key={data.period} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col justify-end h-48 gap-1">
                      <div 
                        className="bg-primary-500 rounded-t"
                        style={{ height: `${(data.value / 250000) * 100}%` }}
                      ></div>
                      {data.target && (
                        <div 
                          className="bg-gray-300 rounded-t"
                          style={{ height: `${(data.target / 250000) * 100}%` }}
                        ></div>
                      )}
                    </div>
                    <span className="text-xs text-gray-600 mt-2">{data.period}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Rating Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Rating Distribution</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">5 Stars</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-success-500 h-2 rounded-full" style={{ width: `${analyticsData.ratingDistribution.fiveStars}%` }}></div>
                  </div>
                  <span className="text-sm font-medium">{analyticsData.ratingDistribution.fiveStars}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">4 Stars</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${analyticsData.ratingDistribution.fourStars}%` }}></div>
                  </div>
                  <span className="text-sm font-medium">{analyticsData.ratingDistribution.fourStars}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">3 Stars</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-warning-500 h-2 rounded-full" style={{ width: `${analyticsData.ratingDistribution.threeStars}%` }}></div>
                  </div>
                  <span className="text-sm font-medium">{analyticsData.ratingDistribution.threeStars}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">2 Stars</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-error-500 h-2 rounded-full" style={{ width: `${analyticsData.ratingDistribution.twoStars}%` }}></div>
                  </div>
                  <span className="text-sm font-medium">{analyticsData.ratingDistribution.twoStars}%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Project Categories */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Popular Categories</h3>
            <div className="space-y-3">
              {analyticsData.categoryData.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{cat.category}</p>
                    <p className="text-xs text-gray-500">{cat.count} projects</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full"
                        style={{ width: `${cat.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8">{cat.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Platform Health */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Platform Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Uptime</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                  <span className="text-sm font-medium">99.9%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Response Time</span>
                <span className="text-sm font-medium">245ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="text-sm font-medium">{analyticsData.platformMetrics.totalProjects.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Error Rate</span>
                <span className="text-sm font-medium text-success-600">0.02%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};