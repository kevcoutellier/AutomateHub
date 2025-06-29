import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Download, 
  Calendar, 
  DollarSign, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Plus
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../stores/authStore';

interface Invoice {
  id: string;
  number: string;
  projectName: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  dueDate: string;
  paidDate?: string;
  createdDate: string;
  description: string;
  expertName: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export const ClientBillingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Redirect if not client
  useEffect(() => {
    if (user && user.role !== 'client') {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      
      // Mock data for invoices
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          number: 'INV-2024-001',
          projectName: 'E-commerce Automation Setup',
          amount: 3500,
          currency: 'USD',
          status: 'paid',
          dueDate: '2024-01-15',
          paidDate: '2024-01-10',
          createdDate: '2024-01-01',
          description: 'Complete e-commerce automation setup with inventory management',
          expertName: 'Sarah Johnson'
        },
        {
          id: '2',
          number: 'INV-2024-002',
          projectName: 'CRM Integration',
          amount: 2200,
          currency: 'USD',
          status: 'pending',
          dueDate: '2024-02-15',
          createdDate: '2024-02-01',
          description: 'HubSpot CRM integration with automated workflows',
          expertName: 'Michael Chen'
        },
        {
          id: '3',
          number: 'INV-2024-003',
          projectName: 'Data Processing Pipeline',
          amount: 4500,
          currency: 'USD',
          status: 'overdue',
          dueDate: '2024-01-30',
          createdDate: '2024-01-15',
          description: 'Automated data processing and reporting system',
          expertName: 'Alex Rodriguez'
        }
      ];

      // Mock data for payment methods
      const mockPaymentMethods: PaymentMethod[] = [
        {
          id: '1',
          type: 'card',
          last4: '4242',
          brand: 'Visa',
          expiryMonth: 12,
          expiryYear: 2025,
          isDefault: true
        },
        {
          id: '2',
          type: 'card',
          last4: '5555',
          brand: 'Mastercard',
          expiryMonth: 8,
          expiryYear: 2026,
          isDefault: false
        }
      ];

      setInvoices(mockInvoices);
      setPaymentMethods(mockPaymentMethods);
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesFilter = filter === 'all' || invoice.status === filter;
    const matchesSearch = invoice.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.expertName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const billingStats = {
    totalSpent: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
    pendingAmount: invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0),
    overdueAmount: invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0),
    totalInvoices: invoices.length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
              <p className="text-gray-600 mt-2">Manage your invoices and payment methods</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Payment Method
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-green-600">
                  ${billingStats.totalSpent.toLocaleString()}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  ${billingStats.pendingAmount.toLocaleString()}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  ${billingStats.overdueAmount.toLocaleString()}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{billingStats.totalInvoices}</p>
              </div>
              <FileText className="w-8 h-8 text-gray-600" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Invoices */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Invoices</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search invoices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-48"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filter
                  </Button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="mb-6">
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'paid', label: 'Paid' },
                    { key: 'pending', label: 'Pending' },
                    { key: 'overdue', label: 'Overdue' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setFilter(tab.key as any)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        filter === tab.key
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Invoices List */}
              <div className="space-y-4">
                {filteredInvoices.map((invoice) => (
                  <div key={invoice.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">{invoice.number}</h3>
                          <Badge className={getStatusColor(invoice.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(invoice.status)}
                              {invoice.status}
                            </div>
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-2">{invoice.projectName}</p>
                        <p className="text-sm text-gray-500 mb-3">{invoice.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Due: {new Date(invoice.dueDate).toLocaleDateString()}
                          </div>
                          <div>Expert: {invoice.expertName}</div>
                          {invoice.paidDate && (
                            <div>Paid: {new Date(invoice.paidDate).toLocaleDateString()}</div>
                          )}
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <p className="text-lg font-semibold text-gray-900">
                          ${invoice.amount.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          {invoice.status === 'pending' && (
                            <Button size="sm">
                              Pay Now
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredInvoices.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No invoices found</p>
                </div>
              )}
            </Card>
          </div>

          {/* Payment Methods */}
          <div>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>

              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-8 h-8 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {method.brand} •••• {method.last4}
                          </p>
                          {method.expiryMonth && method.expiryYear && (
                            <p className="text-sm text-gray-500">
                              Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                            </p>
                          )}
                        </div>
                      </div>
                      {method.isDefault && (
                        <Badge className="bg-primary-100 text-primary-800">
                          Default
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {paymentMethods.length === 0 && (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No payment methods</p>
                  <Button size="sm">Add Payment Method</Button>
                </div>
              )}
            </Card>

            {/* Billing Summary */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Spent</span>
                  <span className="font-medium">${billingStats.totalSpent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending Payments</span>
                  <span className="font-medium text-yellow-600">${billingStats.pendingAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Overdue</span>
                  <span className="font-medium text-red-600">${billingStats.overdueAmount.toLocaleString()}</span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between font-semibold">
                  <span>Total Outstanding</span>
                  <span>${(billingStats.pendingAmount + billingStats.overdueAmount).toLocaleString()}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
