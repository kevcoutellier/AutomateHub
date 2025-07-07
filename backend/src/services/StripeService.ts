import Stripe from 'stripe';
import { stripe } from '../config/stripe';
import { Payment, IPayment } from '../models/Payment';
import { ProjectModel } from '../models/Project';
import { UserModel } from '../models/User';
import mongoose from 'mongoose';

export class StripeService {
  private static readonly PLATFORM_FEE_PERCENTAGE = 0.10; // 10% platform fee

  /**
   * Create a Stripe customer
   */
  static async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    return await stripe.customers.create({
      email,
      name,
    });
  }

  /**
   * Create a payment intent for a project
   */
  static async createPaymentIntent(
    projectId: string,
    clientId: string,
    amount: number,
    currency: string = 'eur'
  ): Promise<{ paymentIntent: Stripe.PaymentIntent; payment: IPayment }> {
    const project = await ProjectModel.findById(projectId).populate('expert');
    if (!project) {
      throw new Error('Project not found');
    }

    const client = await UserModel.findById(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    // Calculate platform fee and expert payout
    const platformFee = Math.round(amount * this.PLATFORM_FEE_PERCENTAGE);
    const expertPayout = amount - platformFee;

    // Create or get Stripe customer
    let stripeCustomerId = client.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await this.createCustomer(client.email, client.name);
      stripeCustomerId = customer.id;
      
      // Update user with Stripe customer ID
      await UserModel.findByIdAndUpdate(clientId, { stripeCustomerId });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: stripeCustomerId,
      description: `Payment for project: ${project.title}`,
      metadata: {
        projectId: projectId,
        clientId: clientId,
        expertId: project.expertId,
      },
    });

    // Create payment record
    const payment = new Payment({
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId,
      projectId: new mongoose.Types.ObjectId(projectId),
      clientId: new mongoose.Types.ObjectId(clientId),
      expertId: new mongoose.Types.ObjectId(project.expertId),
      amount,
      currency,
      status: 'pending',
      description: `Payment for project: ${project.title}`,
      platformFee,
      expertPayout,
      payoutStatus: 'pending',
    });

    await payment.save();

    return { paymentIntent, payment };
  }

  /**
   * Confirm a payment intent
   */
  static async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return await stripe.paymentIntents.confirm(paymentIntentId);
  }

  /**
   * Handle successful payment
   */
  static async handleSuccessfulPayment(paymentIntentId: string): Promise<IPayment> {
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
    if (!payment) {
      throw new Error('Payment not found');
    }

    // Update payment status
    payment.status = 'succeeded';
    await payment.save();

    // Calculate platform fee and expert payout
    const platformFeeAmount = Math.round(payment.amount * 0.1); // 10% platform fee
    const expertPayoutAmount = payment.amount - platformFeeAmount;

    // Update project with payment information
    await ProjectModel.findByIdAndUpdate(payment.projectId, {
      status: 'in-progress',
      paymentStatus: 'completed',
      paymentIntentId: paymentIntentId,
      paymentAmount: payment.amount,
      paymentCurrency: payment.currency,
      paymentDate: new Date(),
      platformFee: platformFeeAmount,
      expertPayout: expertPayoutAmount,
      paymentMethod: 'stripe',
    });

    return payment;
  }

  /**
   * Handle failed payment
   */
  static async handleFailedPayment(paymentIntentId: string): Promise<IPayment> {
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
    if (!payment) {
      throw new Error('Payment not found');
    }

    payment.status = 'failed';
    await payment.save();

    // Update project payment status
    await ProjectModel.findByIdAndUpdate(payment.projectId, {
      paymentStatus: 'failed',
      paymentIntentId: paymentIntentId,
    });

    return payment;
  }

  /**
   * Create a refund
   */
  static async createRefund(
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<{ refund: Stripe.Refund; payment: IPayment }> {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'succeeded') {
      throw new Error('Cannot refund a payment that has not succeeded');
    }

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: amount || payment.amount,
      reason: reason as Stripe.RefundCreateParams.Reason,
    });

    // Update payment record
    payment.status = 'refunded';
    payment.refundAmount = refund.amount;
    payment.refundReason = reason;
    payment.stripeRefundId = refund.id;
    await payment.save();

    // Update project refund information
    await ProjectModel.findByIdAndUpdate(payment.projectId, {
      paymentStatus: 'refunded',
      refundAmount: refund.amount,
      refundReason: reason,
    });

    return { refund, payment };
  }

  /**
   * Get payment methods for a customer
   */
  static async getPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods.data;
  }

  /**
   * Attach payment method to customer
   */
  static async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string
  ): Promise<Stripe.PaymentMethod> {
    return await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  }

  /**
   * Detach payment method from customer
   */
  static async detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    return await stripe.paymentMethods.detach(paymentMethodId);
  }

  /**
   * Create a setup intent for saving payment methods
   */
  static async createSetupIntent(customerId: string): Promise<Stripe.SetupIntent> {
    return await stripe.setupIntents.create({
      customer: customerId,
      usage: 'off_session',
    });
  }

  /**
   * Get payment statistics for a user
   */
  static async getPaymentStats(userId: string, role: 'client' | 'expert') {
    const matchField = role === 'client' ? 'clientId' : 'expertId';
    
    const stats = await Payment.aggregate([
      { $match: { [matchField]: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalPayments: { $sum: 1 },
          successfulPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'succeeded'] }, 1, 0] }
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          failedPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          refundedPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] }
          },
          totalRefunds: { $sum: '$refundAmount' },
        }
      }
    ]);

    return stats[0] || {
      totalAmount: 0,
      totalPayments: 0,
      successfulPayments: 0,
      pendingPayments: 0,
      failedPayments: 0,
      refundedPayments: 0,
      totalRefunds: 0,
    };
  }

  /**
   * Get payment history for a user
   */
  static async getPaymentHistory(
    userId: string,
    role: 'client' | 'expert',
    page: number = 1,
    limit: number = 10
  ) {
    const matchField = role === 'client' ? 'clientId' : 'expertId';
    const skip = (page - 1) * limit;

    const payments = await Payment.find({ [matchField]: userId })
      .populate('projectId', 'title category')
      .populate('clientId', 'name email')
      .populate('expertId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments({ [matchField]: userId });

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Process webhook events
   */
  static async processWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handleSuccessfulPayment(event.data.object.id);
        break;
      
      case 'payment_intent.payment_failed':
        await this.handleFailedPayment(event.data.object.id);
        break;
      
      case 'payment_intent.canceled':
        const payment = await Payment.findOne({ 
          stripePaymentIntentId: event.data.object.id 
        });
        if (payment) {
          payment.status = 'canceled';
          await payment.save();
        }
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }
}
