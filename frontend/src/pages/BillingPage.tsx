import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Download, 
  Filter, 
  Search, 
  Calendar,
  CreditCard,
  TrendingUp,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '../services/api';

const BillingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'payments'>('overview');
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalEarned: 0,
    pendingAmount: 0,
    thisMonth: 0,
    invoiceCount: 0
  });
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    search: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API calls
      const mockInvoices = [
        {
          id: 'INV-2024-001',
          projectTitle: 'Développement App Mobile',
          clientName: 'TechCorp',
          amount: 2500,
          status: 'paid',
          dueDate: '2024-01-15',
          paidDate: '2024-01-12',
          currency: 'EUR'
        },
        {
          id: 'INV-2024-002',
          projectTitle: 'Site E-commerce',
          clientName: 'ShopPlus',
          amount: 1800,
          status: 'pending',
          dueDate: '2024-02-01',
          currency: 'EUR'
        }
      ];

      setInvoices(mockInvoices);
      setStats({
        totalEarned: 15000,
        pendingAmount: 1800,
        thisMonth: 4300,
        invoiceCount: 12
      });
    } catch (error) {
      console.error('Error loading billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'overdue': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Payée';
      case 'pending': return 'En attente';
      case 'overdue': return 'En retard';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Facturation & Paiements</h1>
            <p className="text-gray-600">Gérez vos factures et suivez vos paiements</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Total gagné</div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalEarned.toLocaleString()}€</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">En attente</div>
                <div className="text-2xl font-bold text-gray-900">{stats.pendingAmount.toLocaleString()}€</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Ce mois</div>
                <div className="text-2xl font-bold text-gray-900">{stats.thisMonth.toLocaleString()}€</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">Factures</div>
                <div className="text-2xl font-bold text-gray-900">{stats.invoiceCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
                { id: 'invoices', label: 'Factures', icon: FileText },
                { id: 'payments', label: 'Paiements', icon: CreditCard }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`${
                    activeTab === id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Revenue Chart Placeholder */}
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Graphique des revenus</h3>
                  <p className="text-gray-600">Visualisation des revenus par mois (à implémenter)</p>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Activité récente</h3>
                  <div className="space-y-3">
                    <div className="flex items-center p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Paiement reçu - 2,500€</div>
                        <div className="text-sm text-gray-600">Facture INV-2024-001 • TechCorp</div>
                      </div>
                      <div className="text-sm text-gray-500">Il y a 2 jours</div>
                    </div>
                    
                    <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-500 mr-3" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Nouvelle facture créée</div>
                        <div className="text-sm text-gray-600">Facture INV-2024-002 • ShopPlus</div>
                      </div>
                      <div className="text-sm text-gray-500">Il y a 5 jours</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher une facture..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="paid">Payées</option>
                    <option value="pending">En attente</option>
                    <option value="overdue">En retard</option>
                  </select>
                </div>

                {/* Invoices List */}
                <div className="space-y-4">
                  {invoices.map((invoice: any) => (
                    <div key={invoice.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(invoice.status)}
                          <div>
                            <div className="font-medium text-gray-900">{invoice.id}</div>
                            <div className="text-sm text-gray-600">{invoice.projectTitle}</div>
                            <div className="text-sm text-gray-500">{invoice.clientName}</div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {invoice.amount.toLocaleString()} {invoice.currency}
                          </div>
                          <div className="text-sm text-gray-600">
                            Échéance: {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                              invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {getStatusText(invoice.status)}
                            </span>
                            <button className="text-indigo-600 hover:text-indigo-700">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Historique des paiements</h3>
                  <p className="text-gray-600">Fonctionnalité à implémenter</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
