import React, { useState, useEffect } from 'react';
import { paymentApi, Payment, PaymentHistory as PaymentHistoryType } from '../../services/paymentApi';
import { 
  CreditCard, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle,
  ArrowUpDown,
  Filter
} from 'lucide-react';

interface PaymentHistoryProps {
  className?: string;
}

const PaymentStatusBadge: React.FC<{ status: Payment['status'] }> = ({ status }) => {
  const getStatusConfig = (status: Payment['status']) => {
    switch (status) {
      case 'succeeded':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Succeeded' };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' };
      case 'failed':
        return { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Failed' };
      case 'canceled':
        return { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Canceled' };
      case 'refunded':
        return { color: 'bg-blue-100 text-blue-800', icon: ArrowUpDown, label: 'Refunded' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Unknown' };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};

const PaymentRow: React.FC<{ payment: Payment }> = ({ payment }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
          <div>
            <div className="text-sm font-medium text-gray-900">
              {payment.projectId.title}
            </div>
            <div className="text-sm text-gray-500">
              {payment.projectId.category}
            </div>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {formatAmount(payment.amount, payment.currency)}
        </div>
        {payment.refundAmount && (
          <div className="text-sm text-red-600">
            Refunded: {formatAmount(payment.refundAmount, payment.currency)}
          </div>
        )}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap">
        <PaymentStatusBadge status={payment.status} />
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(payment.createdAt)}
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div>
          <div className="font-medium">{payment.expertId.name}</div>
          <div className="text-xs">{payment.expertId.email}</div>
        </div>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          className="text-blue-600 hover:text-blue-900 transition-colors"
          onClick={() => {
            // Handle view details
            console.log('View payment details:', payment._id);
          }}
        >
          View Details
        </button>
      </td>
    </tr>
  );
};

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ className = '' }) => {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [filterStatus, setFilterStatus] = useState<Payment['status'] | 'all'>('all');

  const loadPaymentHistory = async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError('');
      const history = await paymentApi.getPaymentHistory(page, 10);
      setPaymentHistory(history);
      setCurrentPage(page);
    } catch (error) {
      setError('Failed to load payment history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const handleRefresh = () => {
    loadPaymentHistory(currentPage);
  };

  const handlePageChange = (page: number) => {
    loadPaymentHistory(page);
  };

  const filteredPayments = paymentHistory?.payments.filter(payment => 
    filterStatus === 'all' || payment.status === filterStatus
  ) || [];

  const sortedPayments = [...filteredPayments].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'amount':
        return b.amount - a.amount;
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  if (isLoading && !paymentHistory) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Payment History</h2>
          <div className="flex items-center space-x-3">
            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as Payment['status'] | 'all')}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="succeeded">Succeeded</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="canceled">Canceled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'status')}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Export */}
            <button
              className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => {
                // Handle export
                console.log('Export payment history');
              }}
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expert
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedPayments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No payments found</p>
                  <p className="text-sm text-gray-400">
                    {filterStatus !== 'all' 
                      ? `No payments with status "${filterStatus}"`
                      : 'Your payment history will appear here'
                    }
                  </p>
                </td>
              </tr>
            ) : (
              sortedPayments.map((payment) => (
                <PaymentRow key={payment._id} payment={payment} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paymentHistory && paymentHistory.pagination.pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((paymentHistory.pagination.page - 1) * paymentHistory.pagination.limit) + 1} to{' '}
              {Math.min(
                paymentHistory.pagination.page * paymentHistory.pagination.limit,
                paymentHistory.pagination.total
              )}{' '}
              of {paymentHistory.pagination.total} payments
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="text-sm text-gray-500">
                Page {currentPage} of {paymentHistory.pagination.pages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === paymentHistory.pagination.pages || isLoading}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
