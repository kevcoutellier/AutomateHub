import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  stripePaymentIntentId: string;
  stripeCustomerId?: string;
  projectId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  expertId: mongoose.Types.ObjectId;
  amount: number; // in cents
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled' | 'refunded';
  paymentMethod?: string;
  description?: string;
  metadata?: Record<string, any>;
  refundAmount?: number;
  refundReason?: string;
  stripeChargeId?: string;
  stripeRefundId?: string;
  platformFee: number; // in cents
  expertPayout: number; // in cents
  payoutStatus: 'pending' | 'paid' | 'failed';
  payoutDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  stripePaymentIntentId: {
    type: String,
    required: true,
    unique: true,
  },
  stripeCustomerId: {
    type: String,
    sparse: true,
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  expertId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    required: true,
    default: 'eur',
  },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'canceled', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
  },
  description: {
    type: String,
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
  refundAmount: {
    type: Number,
    min: 0,
  },
  refundReason: {
    type: String,
  },
  stripeChargeId: {
    type: String,
  },
  stripeRefundId: {
    type: String,
  },
  platformFee: {
    type: Number,
    required: true,
    min: 0,
  },
  expertPayout: {
    type: Number,
    required: true,
    min: 0,
  },
  payoutStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  payoutDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes for performance
PaymentSchema.index({ projectId: 1 });
PaymentSchema.index({ clientId: 1 });
PaymentSchema.index({ expertId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ payoutStatus: 1 });
PaymentSchema.index({ stripePaymentIntentId: 1 });
PaymentSchema.index({ createdAt: -1 });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
