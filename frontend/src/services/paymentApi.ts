import api from './api';

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  paymentId: string;
  amount: number;
  currency: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

export interface SetupIntent {
  clientSecret: string;
  setupIntentId: string;
}

export interface PaymentStats {
  totalAmount: number;
  totalPayments: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
  refundedPayments: number;
  totalRefunds: number;
}

export interface Payment {
  _id: string;
  projectId: {
    _id: string;
    title: string;
    category: string;
  };
  clientId: {
    _id: string;
    name: string;
    email: string;
  };
  expertId: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded';
  paymentMethod?: string;
  description?: string;
  refundAmount?: number;
  refundReason?: string;
  platformFee: number;
  expertPayout: number;
  payoutStatus: 'pending' | 'paid' | 'failed';
  payoutDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistory {
  payments: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface StripeConfig {
  publishableKey: string;
}

export const paymentApi = {
  // Create payment intent for a project
  createPaymentIntent: async (projectId: string, amount: number, currency: string = 'eur'): Promise<PaymentIntent> => {
    const response = await api.post('/payments/create-payment-intent', {
      projectId,
      amount,
      currency,
    });
    return response.data.data;
  },

  // Confirm payment intent
  confirmPayment: async (paymentIntentId: string) => {
    const response = await api.post(`/payments/confirm-payment/${paymentIntentId}`);
    return response.data.data;
  },

  // Get payment methods for current user
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await api.get('/payments/payment-methods');
    return response.data.data.paymentMethods;
  },

  // Create setup intent for saving payment methods
  createSetupIntent: async (): Promise<SetupIntent> => {
    const response = await api.post('/payments/setup-intent');
    return response.data.data;
  },

  // Attach payment method to customer
  attachPaymentMethod: async (paymentMethodId: string): Promise<PaymentMethod> => {
    const response = await api.post('/payments/attach-payment-method', {
      paymentMethodId,
    });
    return response.data.data.paymentMethod;
  },

  // Remove payment method
  removePaymentMethod: async (paymentMethodId: string): Promise<void> => {
    await api.delete(`/payments/payment-methods/${paymentMethodId}`);
  },

  // Create refund
  createRefund: async (paymentId: string, amount?: number, reason?: string) => {
    const response = await api.post(`/payments/refund/${paymentId}`, {
      amount,
      reason,
    });
    return response.data.data;
  },

  // Get payment statistics
  getPaymentStats: async (): Promise<PaymentStats> => {
    const response = await api.get('/payments/stats');
    return response.data.data;
  },

  // Get payment history
  getPaymentHistory: async (page: number = 1, limit: number = 10): Promise<PaymentHistory> => {
    const response = await api.get('/payments/history', {
      params: { page, limit },
    });
    return {
      payments: response.data.data,
      pagination: response.data.meta.pagination,
    };
  },

  // Get Stripe configuration
  getStripeConfig: async (): Promise<StripeConfig> => {
    const response = await api.get('/payments/config');
    return response.data.data;
  },
};

export default paymentApi;
