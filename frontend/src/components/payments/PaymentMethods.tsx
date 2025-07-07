import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { paymentApi, PaymentMethod } from '../../services/paymentApi';
import { CreditCard, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

interface PaymentMethodsProps {
  onPaymentMethodAdded?: () => void;
}

const AddPaymentMethodForm: React.FC<{ onSuccess: () => void; onCancel: () => void }> = ({
  onSuccess,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Create setup intent
      const setupIntent = await paymentApi.createSetupIntent();

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm setup intent
      const { error, setupIntent: confirmedSetupIntent } = await stripe.confirmCardSetup(
        setupIntent.clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (error) {
        setError(error.message || 'Failed to add payment method');
      } else if (confirmedSetupIntent.payment_method) {
        // Attach payment method to customer
        await paymentApi.attachPaymentMethod(confirmedSetupIntent.payment_method.id);
        onSuccess();
      }
    } catch (error) {
      setError('Failed to add payment method');
    }

    setIsProcessing(false);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Add New Payment Method
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="border border-gray-300 rounded-lg p-3 bg-white">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !stripe || isProcessing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isProcessing ? 'Adding...' : 'Add Payment Method'}
          </button>
        </div>
      </form>
    </div>
  );
};

const PaymentMethodCard: React.FC<{
  paymentMethod: PaymentMethod;
  onRemove: (id: string) => void;
  isRemoving: boolean;
}> = ({ paymentMethod, onRemove, isRemoving }) => {
  const getCardBrandIcon = (brand: string) => {
    // You can add specific brand icons here
    return <CreditCard className="w-6 h-6 text-gray-600" />;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center">
        {paymentMethod.card && getCardBrandIcon(paymentMethod.card.brand)}
        <div className="ml-3">
          <div className="font-medium text-gray-800">
            {paymentMethod.card?.brand.toUpperCase()} •••• {paymentMethod.card?.last4}
          </div>
          <div className="text-sm text-gray-500">
            Expires {paymentMethod.card?.expMonth}/{paymentMethod.card?.expYear}
          </div>
        </div>
      </div>
      
      <button
        onClick={() => onRemove(paymentMethod.id)}
        disabled={isRemoving}
        className={`p-2 rounded-lg transition-colors ${
          isRemoving
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-red-600 hover:bg-red-50'
        }`}
        title="Remove payment method"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
};

const PaymentMethodsInner: React.FC<PaymentMethodsProps> = ({ onPaymentMethodAdded }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [removingId, setRemovingId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const methods = await paymentApi.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      setError('Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const handleAddSuccess = () => {
    setShowAddForm(false);
    setSuccessMessage('Payment method added successfully');
    loadPaymentMethods();
    onPaymentMethodAdded?.();
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleRemove = async (paymentMethodId: string) => {
    try {
      setRemovingId(paymentMethodId);
      await paymentApi.removePaymentMethod(paymentMethodId);
      setPaymentMethods(methods => 
        methods.filter(method => method.id !== paymentMethodId)
      );
      setSuccessMessage('Payment method removed successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError('Failed to remove payment method');
    } finally {
      setRemovingId('');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Payment Methods</h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Payment Method
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          <span className="text-green-700 text-sm">{successMessage}</span>
        </div>
      )}

      {showAddForm && (
        <div className="mb-6">
          <AddPaymentMethodForm
            onSuccess={handleAddSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      <div className="space-y-4">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No payment methods added yet</p>
            <p className="text-sm">Add a payment method to get started</p>
          </div>
        ) : (
          paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              paymentMethod={method}
              onRemove={handleRemove}
              isRemoving={removingId === method.id}
            />
          ))
        )}
      </div>
    </div>
  );
};

const PaymentMethods: React.FC<PaymentMethodsProps> = (props) => {
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const config = await paymentApi.getStripeConfig();
        const stripe = loadStripe(config.publishableKey);
        setStripePromise(stripe);
      } catch (error) {
        console.error('Failed to initialize Stripe:', error);
      }
    };

    initializeStripe();
  }, []);

  if (!stripePromise) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentMethodsInner {...props} />
    </Elements>
  );
};

export default PaymentMethods;
