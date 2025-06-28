import request from 'supertest';
import { app } from '../../src/app';
import { setupTestDB, teardownTestDB, createTestUser, createTestProject } from '../setup';

describe('Billing Management Integration Tests', () => {
  let clientToken: string;
  let expertToken: string;
  let clientId: string;
  let expertId: string;
  let projectId: string;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    // Create test users
    const client = await createTestUser({ role: 'client' });
    const expert = await createTestUser({ role: 'expert' });
    
    clientId = client.userId;
    expertId = expert.userId;
    clientToken = client.token;
    expertToken = expert.token;

    // Create test project
    const project = await createTestProject({
      clientId: clientId,
      expertId: expertId,
      title: 'Test Project for Billing',
      budget: { total: 5000, currency: 'EUR' }
    });
    projectId = project.id;
  });

  describe('Invoice Management', () => {
    it('should create an invoice for completed project', async () => {
      // Complete the project first
      await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${expertToken}`)
        .send({ status: 'completed' })
        .expect(200);

      const invoiceData = {
        projectId: projectId,
        amount: 5000,
        currency: 'EUR',
        description: 'Project completion payment',
        dueDate: '2024-02-15'
      };

      const response = await request(app)
        .post('/api/billing/invoices')
        .set('Authorization', `Bearer ${expertToken}`)
        .send(invoiceData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.invoice).toMatchObject({
        projectId: projectId,
        amount: 5000,
        currency: 'EUR',
        status: 'pending'
      });
    });

    it('should get invoices for expert', async () => {
      // Create an invoice first
      await request(app)
        .post('/api/billing/invoices')
        .set('Authorization', `Bearer ${expertToken}`)
        .send({
          projectId: projectId,
          amount: 5000,
          currency: 'EUR',
          description: 'Test invoice'
        });

      const response = await request(app)
        .get('/api/billing/invoices')
        .set('Authorization', `Bearer ${expertToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.invoices)).toBe(true);
      expect(response.body.data.invoices.length).toBeGreaterThan(0);
    });

    it('should get invoices for client', async () => {
      const response = await request(app)
        .get('/api/billing/invoices')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.invoices)).toBe(true);
    });

    it('should update invoice status', async () => {
      // Create invoice
      const createResponse = await request(app)
        .post('/api/billing/invoices')
        .set('Authorization', `Bearer ${expertToken}`)
        .send({
          projectId: projectId,
          amount: 5000,
          currency: 'EUR'
        });

      const invoiceId = createResponse.body.data.invoice.id;

      // Update status to paid
      const response = await request(app)
        .put(`/api/billing/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ status: 'paid' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.invoice.status).toBe('paid');
    });

    it('should download invoice PDF', async () => {
      // Create invoice
      const createResponse = await request(app)
        .post('/api/billing/invoices')
        .set('Authorization', `Bearer ${expertToken}`)
        .send({
          projectId: projectId,
          amount: 5000,
          currency: 'EUR'
        });

      const invoiceId = createResponse.body.data.invoice.id;

      const response = await request(app)
        .get(`/api/billing/invoices/${invoiceId}/download`)
        .set('Authorization', `Bearer ${expertToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('application/pdf');
    });

    it('should filter invoices by status', async () => {
      const response = await request(app)
        .get('/api/billing/invoices?status=pending')
        .set('Authorization', `Bearer ${expertToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.invoices)).toBe(true);
    });

    it('should filter invoices by date range', async () => {
      const response = await request(app)
        .get('/api/billing/invoices?dateFrom=2024-01-01&dateTo=2024-12-31')
        .set('Authorization', `Bearer ${expertToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.invoices)).toBe(true);
    });
  });

  describe('Payment Management', () => {
    it('should add payment method', async () => {
      const paymentMethodData = {
        type: 'card',
        cardNumber: '4242424242424242',
        expiryMonth: 12,
        expiryYear: 2025,
        cvc: '123',
        holderName: 'John Doe'
      };

      const response = await request(app)
        .post('/api/billing/payment-methods')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(paymentMethodData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.paymentMethod).toMatchObject({
        type: 'card',
        last4: '4242'
      });
    });

    it('should get payment methods', async () => {
      const response = await request(app)
        .get('/api/billing/payment-methods')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.paymentMethods)).toBe(true);
    });

    it('should set default payment method', async () => {
      // Add payment method first
      const createResponse = await request(app)
        .post('/api/billing/payment-methods')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          type: 'card',
          cardNumber: '4242424242424242',
          expiryMonth: 12,
          expiryYear: 2025,
          cvc: '123'
        });

      const paymentMethodId = createResponse.body.data.paymentMethod.id;

      const response = await request(app)
        .put(`/api/billing/payment-methods/${paymentMethodId}/default`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.paymentMethod.isDefault).toBe(true);
    });

    it('should delete payment method', async () => {
      // Add payment method first
      const createResponse = await request(app)
        .post('/api/billing/payment-methods')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          type: 'card',
          cardNumber: '4242424242424242',
          expiryMonth: 12,
          expiryYear: 2025,
          cvc: '123'
        });

      const paymentMethodId = createResponse.body.data.paymentMethod.id;

      const response = await request(app)
        .delete(`/api/billing/payment-methods/${paymentMethodId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should process payment for invoice', async () => {
      // Create invoice and payment method first
      const invoiceResponse = await request(app)
        .post('/api/billing/invoices')
        .set('Authorization', `Bearer ${expertToken}`)
        .send({
          projectId: projectId,
          amount: 5000,
          currency: 'EUR'
        });

      const invoiceId = invoiceResponse.body.data.invoice.id;

      const paymentResponse = await request(app)
        .post(`/api/billing/invoices/${invoiceId}/pay`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          paymentMethodId: 'pm_test_123',
          amount: 5000
        })
        .expect(200);

      expect(paymentResponse.body.success).toBe(true);
      expect(paymentResponse.body.data.payment.status).toBe('succeeded');
    });
  });

  describe('Billing Statistics', () => {
    it('should get billing overview for expert', async () => {
      const response = await request(app)
        .get('/api/billing/overview')
        .set('Authorization', `Bearer ${expertToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.overview).toMatchObject({
        totalEarned: expect.any(Number),
        pendingAmount: expect.any(Number),
        thisMonth: expect.any(Number),
        invoiceCount: expect.any(Number)
      });
    });

    it('should get billing overview for client', async () => {
      const response = await request(app)
        .get('/api/billing/overview')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.overview).toMatchObject({
        totalSpent: expect.any(Number),
        pendingPayments: expect.any(Number),
        thisMonth: expect.any(Number),
        projectCount: expect.any(Number)
      });
    });

    it('should get revenue analytics', async () => {
      const response = await request(app)
        .get('/api/billing/analytics?timeRange=30d')
        .set('Authorization', `Bearer ${expertToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.analytics).toBeDefined();
      expect(Array.isArray(response.body.data.analytics.revenueByMonth)).toBe(true);
    });
  });

  describe('Payout Management', () => {
    it('should request payout for expert', async () => {
      const payoutData = {
        amount: 1000,
        currency: 'EUR',
        bankAccount: {
          iban: 'FR1420041010050500013M02606',
          bic: 'CCBPFRPPXXX'
        }
      };

      const response = await request(app)
        .post('/api/billing/payouts')
        .set('Authorization', `Bearer ${expertToken}`)
        .send(payoutData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.payout).toMatchObject({
        amount: 1000,
        currency: 'EUR',
        status: 'pending'
      });
    });

    it('should get payout history', async () => {
      const response = await request(app)
        .get('/api/billing/payouts')
        .set('Authorization', `Bearer ${expertToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.payouts)).toBe(true);
    });

    it('should prevent payout for insufficient balance', async () => {
      const payoutData = {
        amount: 100000, // Amount higher than available balance
        currency: 'EUR'
      };

      const response = await request(app)
        .post('/api/billing/payouts')
        .set('Authorization', `Bearer ${expertToken}`)
        .send(payoutData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('insufficient balance');
    });
  });

  describe('Access Control', () => {
    it('should restrict invoice access to project participants', async () => {
      // Create another user not involved in the project
      const outsider = await createTestUser({ role: 'expert' });

      // Create invoice
      const createResponse = await request(app)
        .post('/api/billing/invoices')
        .set('Authorization', `Bearer ${expertToken}`)
        .send({
          projectId: projectId,
          amount: 5000,
          currency: 'EUR'
        });

      const invoiceId = createResponse.body.data.invoice.id;

      // Try to access with outsider token
      await request(app)
        .get(`/api/billing/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${outsider.token}`)
        .expect(403);
    });

    it('should allow only experts to create invoices', async () => {
      const invoiceData = {
        projectId: projectId,
        amount: 5000,
        currency: 'EUR'
      };

      const response = await request(app)
        .post('/api/billing/invoices')
        .set('Authorization', `Bearer ${clientToken}`) // Client trying to create invoice
        .send(invoiceData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('expert');
    });

    it('should allow only clients to pay invoices', async () => {
      // Create invoice
      const createResponse = await request(app)
        .post('/api/billing/invoices')
        .set('Authorization', `Bearer ${expertToken}`)
        .send({
          projectId: projectId,
          amount: 5000,
          currency: 'EUR'
        });

      const invoiceId = createResponse.body.data.invoice.id;

      // Expert trying to pay their own invoice
      const response = await request(app)
        .post(`/api/billing/invoices/${invoiceId}/pay`)
        .set('Authorization', `Bearer ${expertToken}`)
        .send({
          paymentMethodId: 'pm_test_123',
          amount: 5000
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
