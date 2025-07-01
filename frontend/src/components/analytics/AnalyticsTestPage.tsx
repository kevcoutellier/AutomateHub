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
  AlertTriangle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { analyticsApi, AnalyticsData } from '../../services/analyticsApi';

interface ConnectionStatus {
  isConnected: boolean;
  lastChecked: Date;
  error?: string;
}

export const AnalyticsTestPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastChecked: new Date()
  });
  const [usingMockData, setUsingMockData] = useState(false);

  // Mock data fallback
  const mockAnalyticsData: AnalyticsData = {
    platformMetrics: {
      totalProjects: 147,
      successRate: 94.2,
      avgProjectValue: 2850,
      clientSatisfaction: 4.7
    },
    expertMetrics: {
      activeExperts: 23,
      avgResponseTime: '2.3 hours',
      expertRetention: 89,
      avgRating: 4.6
    },
    revenueData: [
      { period: 'Jan', value: 45000, target: 50000 },
      { period: 'Feb', value: 52000, target: 55000 },
      { period: 'Mar', value: 48000, target: 60000 },
      { period: 'Apr', value: 61000, target: 65000 },
      { period: 'May', value: 58000, target: 70000 },
      { period: 'Jun', value: 67000, target: 75000 }
    ],
    projectData: [
      { period: 'Week 1', value: 12 },
      { period: 'Week 2', value: 19 },
      { period: 'Week 3', value: 15 },
      { period: 'Week 4', value: 22 }
    ],
    categoryData: [
      { category: 'E-commerce', count: 45, percentage: 31 },
      { category: 'CRM Integration', count: 32, percentage: 22 },
      { category: 'Marketing Automation', count: 28, percentage: 19 },
      { category: 'Data Analytics', count: 24, percentage: 16 },
      { category: 'Social Media', count: 18, percentage: 12 }
    ],
    ratingDistribution: {
      fiveStars: 68,
      fourStars: 22,
      threeStars: 7,
      twoStars: 2,
      oneStars: 1
    },
    changes: {
      totalProjects: 12.5,
      successRate: 2.3,
      avgProjectValue: 8.7,
      clientSatisfaction: 0.2
    }
  };

  useEffect(() => {
    checkConnection();
    fetchAnalyticsData();
  }, [timeRange]);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/analytics', {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        }
      });
      
      setConnectionStatus({
        isConnected: response.ok,
        lastChecked: new Date(),
        error: response.ok ? undefined : `HTTP ${response.status}`
      });
    } catch (error) {
      setConnectionStatus({
        isConnected: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Connection failed'
      });
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch real data first
      const data = await analyticsApi.getAnalyticsData(timeRange);
      setAnalyticsData(data);
      setUsingMockData(false);
      
      setConnectionStatus(prev => ({
        ...prev,
        isConnected: true,
        error: undefined
      }));
      
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      
      // Fallback to mock data
      setAnalyticsData(mockAnalyticsData);
      setUsingMockData(true);
      setError('Using mock data - API not available');
      
      setConnectionStatus(prev => ({
        ...prev,
        isConnected: false,
        error: err instanceof Error ? err.message : 'API Error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const retryConnection = async () => {
    await checkConnection();
    await fetchAnalyticsData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with Connection Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              connectionStatus.isConnected 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {connectionStatus.isConnected ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <span>API Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span>API Offline</span>
                </>
              )}
            </div>
            
            <Button
              onClick={retryConnection}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        </div>

        {/* Status Banner */}
        {usingMockData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-yellow-800 font-medium">Using Mock Data</p>
                <p className="text-yellow-700 text-sm">
                  API connection failed. Displaying sample data for demonstration.
                  {connectionStatus.error && ` Error: ${connectionStatus.error}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {analyticsData && (
        <>
          {/* Platform Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.platformMetrics.totalProjects.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">
                      +{analyticsData.changes?.totalProjects || 0}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-primary-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.platformMetrics.successRate}%
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">
                      +{analyticsData.changes?.successRate || 0}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Project Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${analyticsData.platformMetrics.avgProjectValue.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">
                      +{analyticsData.changes?.avgProjectValue || 0}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Client Satisfaction</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.platformMetrics.clientSatisfaction}/5.0
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">
                      +{analyticsData.changes?.clientSatisfaction || 0}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Expert Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Experts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.expertMetrics.activeExperts}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.expertMetrics.avgResponseTime}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expert Retention</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.expertMetrics.expertRetention}%
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.expertMetrics.avgRating}/5.0
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Categories Chart */}
          <Card className="p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Popular Categories</h3>
            <div className="space-y-4">
              {analyticsData.categoryData.map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{category.category}</p>
                    <p className="text-xs text-gray-500">{category.count} projects</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-500 h-2 rounded-full"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8">{category.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Connection Debug Info */}
          <Card className="p-6 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Debug Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Data Source:</strong> {usingMockData ? 'Mock Data' : 'Live API'}</p>
                <p><strong>API Status:</strong> {connectionStatus.isConnected ? 'Connected' : 'Disconnected'}</p>
                <p><strong>Last Checked:</strong> {connectionStatus.lastChecked.toLocaleTimeString()}</p>
              </div>
              <div>
                <p><strong>Time Range:</strong> {timeRange}</p>
                <p><strong>Total Projects:</strong> {analyticsData.platformMetrics.totalProjects}</p>
                {connectionStatus.error && (
                  <p><strong>Error:</strong> <span className="text-red-600">{connectionStatus.error}</span></p>
                )}
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
