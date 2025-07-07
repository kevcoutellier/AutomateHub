import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import PaymentDashboard from '../components/payments/PaymentDashboard';
import { projectApi, Project as BaseProject } from '../services/projectApi';
import { ArrowLeft, AlertCircle, CheckCircle, CreditCard } from 'lucide-react';

// Extend the base Project interface with payment-related fields
interface Project extends BaseProject {
  paymentStatus?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentAmount?: number;
  paymentCurrency?: string;
}

const PaymentPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        setError('Project ID is required');
        setIsLoading(false);
        return;
      }

      try {
        const projectData = await projectApi.getProject(projectId);
        setProject(projectData);
      } catch (error) {
        setError('Failed to load project details');
        console.error('Error loading project:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'refunded':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
        return <CreditCard className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const canMakePayment = () => {
    if (!project || !user) return false;
    
    // Only clients can make payments
    if (user.role !== 'client') return false;
    
    // Only the project client can make payments
    if (project.clientId !== user._id) return false;
    
    // Can only pay if payment is pending or failed (default to pending if not set)
    const paymentStatus = project.paymentStatus || 'pending';
    return paymentStatus === 'pending' || paymentStatus === 'failed';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Project</h2>
          <p className="text-gray-600 mb-6">{error || 'Project not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Project Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h1>
              <p className="text-gray-600 mb-4">{project.description}</p>
              
              <div className="flex items-center space-x-6">
                <div>
                  <span className="text-sm font-medium text-gray-500">Project Budget</span>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(project.budget.allocated, project.paymentCurrency || 'EUR')}
                  </p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Payment Status</span>
                  <div className={`flex items-center mt-1 px-2 py-1 rounded-md border text-sm font-medium ${getPaymentStatusColor(project.paymentStatus || 'pending')}`}>
                    {getPaymentStatusIcon(project.paymentStatus || 'pending')}
                    <span className="ml-1 capitalize">{project.paymentStatus || 'pending'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status Messages */}
        {project.paymentStatus === 'completed' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <div>
                <h3 className="font-semibold text-green-800">Payment Completed</h3>
                <p className="text-green-700 text-sm">
                  Your payment has been successfully processed. The project is now active.
                </p>
              </div>
            </div>
          </div>
        )}

        {project.paymentStatus === 'failed' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <div>
                <h3 className="font-semibold text-red-800">Payment Failed</h3>
                <p className="text-red-700 text-sm">
                  Your previous payment attempt failed. Please try again with a different payment method.
                </p>
              </div>
            </div>
          </div>
        )}

        {project.paymentStatus === 'refunded' && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 text-purple-500 mr-2" />
              <div>
                <h3 className="font-semibold text-purple-800">Payment Refunded</h3>
                <p className="text-purple-700 text-sm">
                  This payment has been refunded. The refund should appear in your account within 5-10 business days.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Access Control */}
        {!canMakePayment() && user?.role === 'client' && project.clientId !== user._id && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
              <div>
                <h3 className="font-semibold text-yellow-800">Access Restricted</h3>
                <p className="text-yellow-700 text-sm">
                  You can only make payments for your own projects.
                </p>
              </div>
            </div>
          </div>
        )}

        {user?.role === 'expert' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CreditCard className="w-5 h-5 text-blue-500 mr-2" />
              <div>
                <h3 className="font-semibold text-blue-800">Expert View</h3>
                <p className="text-blue-700 text-sm">
                  As an expert, you can view payment information but cannot process payments.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Dashboard */}
        {canMakePayment() ? (
          <PaymentDashboard
            projectId={project._id}
            amount={project.budget.allocated * 100} // Convert to cents
            currency={project.paymentCurrency || 'EUR'}
          />
        ) : (
          <PaymentDashboard />
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
