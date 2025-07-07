import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './PaymentForm';
import PaymentMethods from './PaymentMethods';
import PaymentHistory from './PaymentHistory';
import PaymentStats from './PaymentStats';
import { 
  CreditCard, 
  History, 
  BarChart3, 
  Plus,
  Settings,
  Shield,
  HelpCircle
} from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentDashboardProps {
  projectId?: string;
  amount?: number;
  currency?: string;
  className?: string;
}

type TabType = 'overview' | 'payment' | 'methods' | 'history' | 'stats';

const PaymentDashboard: React.FC<PaymentDashboardProps> = ({
  projectId,
  amount,
  currency = 'EUR',
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: BarChart3 },
    { id: 'payment' as TabType, label: 'Make Payment', icon: CreditCard },
    { id: 'methods' as TabType, label: 'Payment Methods', icon: Settings },
    { id: 'history' as TabType, label: 'Payment History', icon: History },
    { id: 'stats' as TabType, label: 'Statistics', icon: BarChart3 },
  ];

  const handlePaymentSuccess = () => {
    setActiveTab('history');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Quick Stats */}
            <PaymentStats className="mb-6" />
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('payment')}
                  className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Payment
                </button>
                
                <button
                  onClick={() => setActiveTab('methods')}
                  className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Manage Cards
                </button>
                
                <button
                  onClick={() => setActiveTab('history')}
                  className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <History className="w-4 h-4 mr-2" />
                  View History
                </button>
                
                <button
                  onClick={() => setActiveTab('stats')}
                  className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Stats
                </button>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800">Secure Payments</h4>
                  <p className="text-blue-700 text-sm mt-1">
                    All payments are processed securely through Stripe. Your card information is never stored on our servers.
                  </p>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start">
                <HelpCircle className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-800">Need Help?</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    If you have any questions about payments or need assistance, please contact our support team.
                  </p>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2">
                    Contact Support →
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Make a Payment</h3>
              <PaymentForm
                stripePromise={stripePromise}
                projectId={projectId || ''}
                amount={amount || 0}
                currency={currency}
                onSuccess={handlePaymentSuccess}
              />
            </div>
          </div>
        );

      case 'methods':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Methods</h3>
              <Elements stripe={stripePromise}>
                <PaymentMethods />
              </Elements>
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment History</h3>
              <PaymentHistory />
            </div>
          </div>
        );

      case 'stats':
        return (
          <div className="space-y-6">
            <PaymentStats />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`max-w-7xl mx-auto ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Dashboard</h1>
        <p className="text-gray-600">
          Manage your payments, payment methods, and view transaction history.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default PaymentDashboard;
