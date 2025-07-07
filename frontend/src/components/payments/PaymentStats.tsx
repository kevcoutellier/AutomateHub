import React, { useState, useEffect } from 'react';
import { paymentApi, PaymentStats as PaymentStatsType } from '../../services/paymentApi';
import { 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertCircle 
} from 'lucide-react';

interface PaymentStatsProps {
  className?: string;
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}> = ({ title, value, icon: Icon, color, subtitle }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </div>
  );
};

const PaymentStats: React.FC<PaymentStatsProps> = ({ className = '' }) => {
  const [stats, setStats] = useState<PaymentStatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError('');
      const paymentStats = await paymentApi.getPaymentStats();
      setStats(paymentStats);
    } catch (error) {
      setError('Failed to load payment statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount / 100);
  };

  const calculateSuccessRate = () => {
    if (!stats || stats.totalPayments === 0) return 0;
    return Math.round((stats.successfulPayments / stats.totalPayments) * 100);
  };

  const getSuccessRateColor = () => {
    const rate = calculateSuccessRate();
    if (rate >= 90) return '#10B981'; // green
    if (rate >= 70) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Payment Statistics</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Payment Statistics</h2>
        <button
          onClick={loadStats}
          disabled={isLoading}
          className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalAmount)}
            icon={DollarSign}
            color="#10B981"
            subtitle={`${stats.totalPayments} payments`}
          />

          {/* Success Rate */}
          <StatCard
            title="Success Rate"
            value={`${calculateSuccessRate()}%`}
            icon={TrendingUp}
            color={getSuccessRateColor()}
            subtitle={`${stats.successfulPayments} successful`}
          />

          {/* Pending Payments */}
          <StatCard
            title="Pending Payments"
            value={stats.pendingPayments}
            icon={Clock}
            color="#F59E0B"
            subtitle="Awaiting completion"
          />

          {/* Failed Payments */}
          <StatCard
            title="Failed Payments"
            value={stats.failedPayments}
            icon={XCircle}
            color="#EF4444"
            subtitle="Requires attention"
          />
        </div>
      )}

      {/* Additional Stats */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-gray-700">Successful</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{stats.successfulPayments}</div>
                  <div className="text-sm text-gray-500">
                    {stats.totalPayments > 0 
                      ? `${Math.round((stats.successfulPayments / stats.totalPayments) * 100)}%`
                      : '0%'
                    }
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="text-gray-700">Pending</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{stats.pendingPayments}</div>
                  <div className="text-sm text-gray-500">
                    {stats.totalPayments > 0 
                      ? `${Math.round((stats.pendingPayments / stats.totalPayments) * 100)}%`
                      : '0%'
                    }
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-gray-700">Failed</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{stats.failedPayments}</div>
                  <div className="text-sm text-gray-500">
                    {stats.totalPayments > 0 
                      ? `${Math.round((stats.failedPayments / stats.totalPayments) * 100)}%`
                      : '0%'
                    }
                  </div>
                </div>
              </div>

              {stats.refundedPayments > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="text-gray-700">Refunded</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{stats.refundedPayments}</div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(stats.totalRefunds)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <CreditCard className="w-4 h-4 mr-2" />
                View Payment History
              </button>
              
              <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <DollarSign className="w-4 h-4 mr-2" />
                Export Financial Report
              </button>
              
              {stats.pendingPayments > 0 && (
                <button className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                  <Clock className="w-4 h-4 mr-2" />
                  Review Pending Payments ({stats.pendingPayments})
                </button>
              )}
              
              {stats.failedPayments > 0 && (
                <button className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  <XCircle className="w-4 h-4 mr-2" />
                  Review Failed Payments ({stats.failedPayments})
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats && stats.totalPayments === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Payments Yet</h3>
          <p className="text-gray-500 mb-6">
            Your payment statistics will appear here once you start processing payments.
          </p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Create Your First Project
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentStats;
