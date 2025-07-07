import express, { Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { StripeService } from '../services/StripeService';
import { ApiResponseHelper } from '../utils/apiResponse';
import { stripe } from '../config/stripe';
import { stripeConfig } from '../config/stripe';
import { Payment } from '../models/Payment';
import { AuthenticatedRequest } from '../types';

const router = express.Router();

/**
 * Create payment intent for a project
 */
router.post('/create-payment-intent',
  authenticate,
  [
    body('projectId').isMongoId().withMessage('Valid project ID is required'),
    body('amount').isInt({ min: 100 }).withMessage('Amount must be at least 100 cents'),
    body('currency').optional().isIn(['eur', 'usd']).withMessage('Currency must be EUR or USD'),
  ],
  async (req: AuthenticatedRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponseHelper.validationError(res, errors.array());
      }

      const { projectId, amount, currency = 'eur' } = req.body;
      const clientId = req.user!._id.toString();

      const { paymentIntent, payment } = await StripeService.createPaymentIntent(
        projectId,
        clientId,
        amount,
        currency
      );

      return ApiResponseHelper.success(res, {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        paymentId: payment._id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      }, 'Payment intent created successfully');
    } catch (error) {
      console.error('Create payment intent error:', error);
      return ApiResponseHelper.error(res, 'Failed to create payment intent', 500);
    }
  }
);

/**
 * Confirm payment intent
 */
router.post('/confirm-payment/:paymentIntentId',
  authenticate,
  [
    param('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
  ],
  async (req: AuthenticatedRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponseHelper.validationError(res, errors.array());
      }

      const { paymentIntentId } = req.params;

      const paymentIntent = await StripeService.confirmPaymentIntent(paymentIntentId);

      return ApiResponseHelper.success(res, {
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        },
      }, 'Payment confirmed successfully');
    } catch (error) {
      console.error('Confirm payment error:', error);
      return ApiResponseHelper.error(res, 'Failed to confirm payment', 500);
    }
  }
);

/**
 * Get payment methods for current user
 */
router.get('/payment-methods',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      
      if (!user.stripeCustomerId) {
        return ApiResponseHelper.success(res, { paymentMethods: [] }, 'No payment methods found');
      }

      const paymentMethods = await StripeService.getPaymentMethods(user.stripeCustomerId);

      return ApiResponseHelper.success(res, {
        paymentMethods: paymentMethods.map(pm => ({
          id: pm.id,
          type: pm.type,
          card: pm.card ? {
            brand: pm.card.brand,
            last4: pm.card.last4,
            expMonth: pm.card.exp_month,
            expYear: pm.card.exp_year,
          } : null,
        })),
      }, 'Payment methods retrieved successfully');
    } catch (error) {
      console.error('Get payment methods error:', error);
      return ApiResponseHelper.error(res, 'Failed to retrieve payment methods', 500);
    }
  }
);

/**
 * Create setup intent for saving payment methods
 */
router.post('/setup-intent',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      
      // Create customer if doesn't exist
      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await StripeService.createCustomer(user.email, user.name);
        stripeCustomerId = customer.id;
        
        // Update user with Stripe customer ID
        user.stripeCustomerId = stripeCustomerId;
        await user.save();
      }

      const setupIntent = await StripeService.createSetupIntent(stripeCustomerId);

      return ApiResponseHelper.success(res, {
        clientSecret: setupIntent.client_secret,
        setupIntentId: setupIntent.id,
      }, 'Setup intent created successfully');
    } catch (error) {
      console.error('Create setup intent error:', error);
      return ApiResponseHelper.error(res, 'Failed to create setup intent', 500);
    }
  }
);

/**
 * Attach payment method to customer
 */
router.post('/attach-payment-method',
  authenticate,
  [
    body('paymentMethodId').notEmpty().withMessage('Payment method ID is required'),
  ],
  async (req: AuthenticatedRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponseHelper.validationError(res, errors.array());
      }

      const { paymentMethodId } = req.body;
      const user = req.user!;

      if (!user.stripeCustomerId) {
        return ApiResponseHelper.error(res, 'No Stripe customer found', 400);
      }

      const paymentMethod = await StripeService.attachPaymentMethod(
        paymentMethodId,
        user.stripeCustomerId
      );

      return ApiResponseHelper.success(res, {
        paymentMethod: {
          id: paymentMethod.id,
          type: paymentMethod.type,
          card: paymentMethod.card ? {
            brand: paymentMethod.card.brand,
            last4: paymentMethod.card.last4,
            expMonth: paymentMethod.card.exp_month,
            expYear: paymentMethod.card.exp_year,
          } : null,
        },
      }, 'Payment method attached successfully');
    } catch (error) {
      console.error('Attach payment method error:', error);
      return ApiResponseHelper.error(res, 'Failed to attach payment method', 500);
    }
  }
);

/**
 * Detach payment method from customer
 */
router.delete('/payment-methods/:paymentMethodId',
  authenticate,
  [
    param('paymentMethodId').notEmpty().withMessage('Payment method ID is required'),
  ],
  async (req: AuthenticatedRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponseHelper.validationError(res, errors.array());
      }

      const { paymentMethodId } = req.params;

      await StripeService.detachPaymentMethod(paymentMethodId);

      return ApiResponseHelper.success(res, null, 'Payment method removed successfully');
    } catch (error) {
      console.error('Detach payment method error:', error);
      return ApiResponseHelper.error(res, 'Failed to remove payment method', 500);
    }
  }
);

/**
 * Create refund
 */
router.post('/refund/:paymentId',
  authenticate,
  [
    param('paymentId').isMongoId().withMessage('Valid payment ID is required'),
    body('amount').optional().isInt({ min: 1 }).withMessage('Amount must be positive'),
    body('reason').optional().isString().withMessage('Reason must be a string'),
  ],
  async (req: AuthenticatedRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponseHelper.validationError(res, errors.array());
      }

      const { paymentId } = req.params;
      const { amount, reason } = req.body;

      // Check if user has permission to refund (admin or project owner)
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return ApiResponseHelper.notFound(res, 'Payment not found');
      }

      const user = req.user!;
      const isAdmin = user.role === 'admin';
      const isProjectOwner = payment.clientId.toString() === user._id.toString();

      if (!isAdmin && !isProjectOwner) {
        return ApiResponseHelper.error(res, 'Unauthorized to refund this payment', 403);
      }

      const { refund, payment: updatedPayment } = await StripeService.createRefund(
        paymentId,
        amount,
        reason
      );

      return ApiResponseHelper.success(res, {
        refund: {
          id: refund.id,
          amount: refund.amount,
          status: refund.status,
          reason: refund.reason,
        },
        payment: {
          id: updatedPayment._id,
          status: updatedPayment.status,
          refundAmount: updatedPayment.refundAmount,
        },
      }, 'Refund created successfully');
    } catch (error) {
      console.error('Create refund error:', error);
      return ApiResponseHelper.error(res, 'Failed to create refund', 500);
    }
  }
);

/**
 * Get payment statistics
 */
router.get('/stats',
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const user = req.user!;
      const role = user.role === 'expert' ? 'expert' : 'client';

      const stats = await StripeService.getPaymentStats(user._id.toString(), role);

      return ApiResponseHelper.success(res, stats, 'Payment statistics retrieved successfully');
    } catch (error) {
      console.error('Get payment stats error:', error);
      return ApiResponseHelper.error(res, 'Failed to retrieve payment statistics', 500);
    }
  }
);

/**
 * Get payment history
 */
router.get('/history',
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  ],
  async (req: AuthenticatedRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponseHelper.validationError(res, errors.array());
      }

      const user = req.user!;
      const role = user.role === 'expert' ? 'expert' : 'client';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await StripeService.getPaymentHistory(
        user._id.toString(),
        role,
        page,
        limit
      );

      return ApiResponseHelper.paginated(res, result.payments, result.pagination, 'Payment history retrieved successfully');
    } catch (error) {
      console.error('Get payment history error:', error);
      return ApiResponseHelper.error(res, 'Failed to retrieve payment history', 500);
    }
  }
);

/**
 * Get Stripe publishable key
 */
router.get('/config',
  (req, res) => {
    return ApiResponseHelper.success(res, {
      publishableKey: stripeConfig.publishableKey,
    }, 'Stripe configuration retrieved successfully');
  }
);

/**
 * Stripe webhook endpoint
 */
router.post('/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'] as string;
      
      if (!stripeConfig.webhookSecret) {
        console.error('Webhook secret not configured');
        return res.status(400).send('Webhook secret not configured');
      }

      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        stripeConfig.webhookSecret
      );

      await StripeService.processWebhook(event);

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).send(`Webhook Error: ${error}`);
    }
  }
);

export default router;
