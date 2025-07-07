# Stripe Integration Documentation

## Overview

AutomateHub now includes a comprehensive Stripe payment integration that handles:
- Payment processing for project payments
- Payment method management
- Subscription billing (future enhancement)
- Refunds and disputes
- Webhook processing
- Payment analytics

## Backend Implementation

### 1. Dependencies Added

```json
{
  "stripe": "^14.11.0",
  "@types/stripe": "^8.0.417"
}
```

### 2. Environment Configuration

Add these variables to your `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_SUCCESS_URL=http://localhost:5173/payment/success
STRIPE_CANCEL_URL=http://localhost:5173/payment/cancel
```

### 3. Files Created

#### Models
- `src/models/Payment.ts` - Payment transaction model with full metadata
- Updated `src/models/User.ts` - Added `stripeCustomerId` field
- Updated `src/types/index.ts` - Added payment-related interfaces

#### Services
- `src/config/stripe.ts` - Stripe client configuration
- `src/services/StripeService.ts` - Comprehensive payment service

#### Routes
- `src/routes/payments.ts` - Full payment API endpoints

### 4. API Endpoints

#### Payment Processing
- `POST /api/v1/payments/create-payment-intent` - Create payment intent
- `POST /api/v1/payments/confirm-payment/:paymentIntentId` - Confirm payment
- `POST /api/v1/payments/webhook` - Stripe webhook handler

#### Payment Methods
- `GET /api/v1/payments/payment-methods` - Get user's payment methods
- `POST /api/v1/payments/setup-intent` - Create setup intent for saving cards
- `POST /api/v1/payments/attach-payment-method` - Attach payment method
- `DELETE /api/v1/payments/payment-methods/:id` - Remove payment method

#### Payment Management
- `POST /api/v1/payments/refund/:paymentId` - Create refund
- `GET /api/v1/payments/stats` - Payment statistics
- `GET /api/v1/payments/history` - Payment history with pagination

#### Configuration
- `GET /api/v1/payments/config` - Get Stripe publishable key

### 5. Key Features

#### Automatic Customer Creation
- Creates Stripe customers automatically on first payment
- Links Stripe customer ID to user account
- Handles customer updates and metadata

#### Platform Fee Handling
- 10% platform fee automatically calculated
- Separate tracking of platform revenue and expert payouts
- Configurable fee structure

#### Security
- Webhook signature verification
- Secure API key management
- Payment intent confirmation flow
- Rate limiting on payment endpoints

#### Error Handling
- Comprehensive error responses
- Failed payment tracking
- Automatic retry logic for webhooks

## Frontend Implementation

### 1. Dependencies Added

```json
{
  "@stripe/stripe-js": "^2.4.0",
  "@stripe/react-stripe-js": "^2.4.0"
}
```

### 2. Components Created

#### Payment Processing
- `src/components/payments/PaymentForm.tsx` - Complete payment form with Stripe Elements
- `src/services/paymentApi.ts` - Frontend API service for payments

#### Payment Management
- `src/components/payments/PaymentMethods.tsx` - Payment method management
- `src/components/payments/PaymentHistory.tsx` - Payment history with filtering

### 3. Key Features

#### Stripe Elements Integration
- Secure card input with real-time validation
- Customizable styling to match your brand
- Mobile-responsive design
- Support for multiple payment methods

#### Payment Method Management
- Save payment methods for future use
- Remove saved payment methods
- Display card information securely
- Setup intents for card saving

#### Payment History
- Paginated payment history
- Status filtering and sorting
- Export functionality
- Detailed payment information

## Usage Examples

### 1. Processing a Payment

```typescript
// Backend - Create payment intent
const { paymentIntent, payment } = await StripeService.createPaymentIntent(
  projectId,
  amount, // in cents
  'eur'
);

// Frontend - Process payment
const paymentIntent = await paymentApi.createPaymentIntent(projectId, amount);
// Use Stripe Elements to collect payment and confirm
```

### 2. Managing Payment Methods

```typescript
// Save a payment method
const setupIntent = await paymentApi.createSetupIntent();
// Use Stripe Elements to collect card and confirm setup intent

// List payment methods
const paymentMethods = await paymentApi.getPaymentMethods();

// Remove payment method
await paymentApi.removePaymentMethod(paymentMethodId);
```

### 3. Handling Webhooks

```typescript
// Webhook endpoint automatically processes:
// - payment_intent.succeeded
// - payment_intent.payment_failed
// - payment_intent.canceled

// Updates payment status and project status automatically
```

## Database Schema

### Payment Model

```typescript
interface IPayment {
  stripePaymentIntentId: string;
  stripeCustomerId?: string;
  projectId: ObjectId;
  clientId: ObjectId;
  expertId: ObjectId;
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
```

### User Model Updates

```typescript
interface User {
  // ... existing fields
  stripeCustomerId?: string; // Links to Stripe customer
}
```

## Security Considerations

### 1. API Keys
- Use test keys in development
- Store production keys securely
- Never expose secret keys in frontend

### 2. Webhook Security
- Verify webhook signatures
- Use HTTPS endpoints only
- Implement idempotency for webhook processing

### 3. Payment Validation
- Validate amounts server-side
- Check user permissions for refunds
- Implement rate limiting

## Testing

### 1. Test Cards
Use Stripe's test cards for development:

```
4242424242424242 - Visa (succeeds)
4000000000000002 - Visa (declined)
4000000000009995 - Visa (insufficient funds)
```

### 2. Webhook Testing
Use Stripe CLI for local webhook testing:

```bash
stripe listen --forward-to localhost:5000/api/v1/payments/webhook
```

## Deployment

### 1. Environment Setup
- Set production Stripe keys
- Configure webhook endpoints
- Set up proper CORS origins

### 2. Webhook Configuration
Create webhooks in Stripe Dashboard for:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`

### 3. Monitoring
- Monitor payment success rates
- Set up alerts for failed payments
- Track platform fee collection

## Future Enhancements

### 1. Subscription Billing
- Monthly/yearly expert subscriptions
- Tiered pricing plans
- Automatic billing cycles

### 2. Multi-party Payments
- Direct payouts to experts
- Stripe Connect integration
- Marketplace fee collection

### 3. Advanced Features
- Payment links for invoicing
- Installment payments
- International payment methods

## Support and Troubleshooting

### Common Issues

1. **Payment Intent Creation Fails**
   - Check Stripe API keys
   - Verify user has valid Stripe customer
   - Check amount is above minimum (50 cents)

2. **Webhook Not Processing**
   - Verify webhook secret
   - Check endpoint URL is accessible
   - Ensure HTTPS in production

3. **Payment Method Save Fails**
   - Check setup intent configuration
   - Verify customer exists
   - Check card details are valid

### Debugging

Enable Stripe logs in development:

```typescript
// In stripe config
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
  telemetry: false, // Disable in production
});
```

## API Documentation

For detailed API documentation, visit `/api` endpoint when the server is running.

## Support

For Stripe-specific issues:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com/)

For AutomateHub integration issues:
- Check server logs
- Verify environment configuration
- Test with Stripe test mode first
