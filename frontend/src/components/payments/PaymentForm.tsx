import React, { useState, useEffect } from 'react';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { paymentApi } from '../../services/paymentApi';
import { CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react';

interface PaymentFormProps {
  projectId: string;
  amount: number;
  currency?: string;
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: string) => void;
}

interface PaymentFormInnerProps extends PaymentFormProps {
  stripePromise: Promise<Stripe | null>;
}

const PaymentFormInner: React.FC<PaymentFormProps> = ({
  projectId,
  amount,
  currency = 'eur',
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const paymentIntent = await paymentApi.createPaymentIntent(
          projectId,
          amount,
          currency
        );
        setClientSecret(paymentIntent.clientSecret);
      } catch (error) {
        const errorMessage = 'Failed to initialize payment';
        setError(errorMessage);
        onError?.(errorMessage);
      }
    };

    createPaymentIntent();
  }, [projectId, amount, currency, onError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setError('');

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      setIsProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
        },
      }
    );

    if (error) {
      setError(error.message || 'Payment failed');
      onError?.(error.message || 'Payment failed');
    } else if (paymentIntent.status === 'succeeded') {
      setSuccess(true);
      onSuccess?.(paymentIntent);
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

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Payment Successful!
        </h3>
        <p className="text-green-600">
          Your payment has been processed successfully.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <CreditCard className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">
          Payment Details
        </h2>
      </div>

      <div className="mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Amount:</span>
            <span className="text-lg font-semibold text-gray-800">
              {(amount / 100).toFixed(2)} {currency.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Platform Fee (10%):</span>
            <span className="text-gray-600">
              {(amount * 0.1 / 100).toFixed(2)} {currency.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
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

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <Lock className="w-4 h-4 mr-1" />
            <span>Secured by Stripe</span>
          </div>
          
          <button
            type="submit"
            disabled={!stripe || isProcessing || !clientSecret}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              !stripe || isProcessing || !clientSecret
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isProcessing ? 'Processing...' : `Pay ${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`}
          </button>
        </div>
      </form>
    </div>
  );
};

const PaymentForm: React.FC<PaymentFormInnerProps> = ({
  stripePromise,
  ...props
}) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormInner {...props} />
    </Elements>
  );
};

// Hook to initialize Stripe
export const useStripePayment = () => {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

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

  return stripePromise;
};

export default PaymentForm;
