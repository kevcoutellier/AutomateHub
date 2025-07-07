import request from 'supertest';
import { app } from '../../src/app';
import { createTestUser, createTestProject, generateTestToken } from '../setup';
import '../setup'; // This will run the global setup

describe('Admin Moderation Integration Tests', () => {
  let adminToken: string;
  let clientToken: string;
  let expertToken: string;
  let adminId: string;
  let clientId: string;
  let expertId: string;
  let projectId: string;

  // Global setup and teardown are handled in ../setup.ts

  beforeEach(async () => {
    // Create test users
    const admin = await createTestUser({ 
      role: 'admin',
      email: 'admin@test.com'
    });
    const client = await createTestUser({ 
      role: 'client',
      email: 'client@test.com'
    });
    const expert = await createTestUser({ 
      role: 'expert',
      email: 'expert@test.com'
    });
    
    adminId = admin._id.toString();
    clientId = client._id.toString();
    expertId = expert._id.toString();
    adminToken = generateTestToken(adminId);
    clientToken = generateTestToken(clientId);
    expertToken = generateTestToken(expertId);

    // Create test project
    const project = await createTestProject(clientId, expertId, {
      title: 'Test Project for Moderation'
    });
    projectId = project._id.toString();
  });

  describe('User Management', () => {
    it('should get all users for admin', async () => {
      const response = await request(app)
        .get('/api/v1/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.users)).toBe(true);
      expect(response.body.data.users.length).toBeGreaterThan(0);
    });

    it('should filter users by role', async () => {
      const response = await request(app)
        .get('/api/v1/v1/admin/users?role=expert')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users.every((user: any) => user.role === 'expert')).toBe(true);
    });

    it('should filter users by status', async () => {
      const response = await request(app)
        .get('/api/v1/v1/admin/users?status=active')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users.every((user: any) => user.status === 'active')).toBe(true);
    });

    it('should search users by name or email', async () => {
      const response = await request(app)
        .get('/api/v1/v1/admin/users?search=test')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });

    it('should suspend user account', async () => {
      const response = await request(app)
        .put(`/api/v1/v1/admin/users/${expertId}/suspend`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Inappropriate behavior' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.status).toBe('suspended');
    });

    it('should reactivate suspended user', async () => {
      // Suspend user first
      await request(app)
        .put(`/api/v1/v1/admin/users/${expertId}/suspend`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test suspension' });

      // Reactivate user
      const response = await request(app)
        .put(`/api/v1/v1/admin/users/${expertId}/activate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.status).toBe('active');
    });

    it('should get user details', async () => {
      const response = await request(app)
        .get(`/api/v1/v1/admin/users/${expertId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(expertId);
      expect(response.body.data.user.projects).toBeDefined();
      expect(response.body.data.user.stats).toBeDefined();
    });

    it('should update user role', async () => {
      const response = await request(app)
        .put(`/api/v1/admin/users/${clientId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'expert' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('expert');
    });

    it('should prevent non-admin access', async () => {
      await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });
  });

  describe('Project Moderation', () => {
    it('should get all projects for admin', async () => {
      const response = await request(app)
        .get('/api/v1/admin/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.projects)).toBe(true);
    });

    it('should filter projects by status', async () => {
      const response = await request(app)
        .get('/api/v1/admin/projects?status=in-progress')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.projects)).toBe(true);
    });

    it('should get flagged projects', async () => {
      const response = await request(app)
        .get('/api/v1/admin/projects?flagged=true')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.projects)).toBe(true);
    });

    it('should suspend project', async () => {
      const response = await request(app)
        .put(`/api/v1/admin/projects/${projectId}/suspend`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Policy violation' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project.status).toBe('suspended');
    });

    it('should get project moderation history', async () => {
      const response = await request(app)
        .get(`/api/v1/admin/projects/${projectId}/moderation-history`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.history)).toBe(true);
    });
  });

  describe('Report Management', () => {
    let reportId: string;

    beforeEach(async () => {
      // Create a test report
      const reportResponse = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          projectId: projectId,
          reportType: 'inappropriate_behavior',
          description: 'Expert was unprofessional',
          reportedUserId: expertId
        });
      
      reportId = reportResponse.body.data.report.id;
    });

    it('should get all reports for admin', async () => {
      const response = await request(app)
        .get('/api/v1/admin/reports')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.reports)).toBe(true);
      expect(response.body.data.reports.length).toBeGreaterThan(0);
    });

    it('should filter reports by status', async () => {
      const response = await request(app)
        .get('/api/v1/admin/reports?status=pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reports.every((report: any) => report.status === 'pending')).toBe(true);
    });

    it('should filter reports by severity', async () => {
      const response = await request(app)
        .get('/api/v1/admin/reports?severity=high')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.reports)).toBe(true);
    });

    it('should get report details', async () => {
      const response = await request(app)
        .get(`/api/v1/admin/reports/${reportId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.report.id).toBe(reportId);
      expect(response.body.data.report.project).toBeDefined();
      expect(response.body.data.report.reportedBy).toBeDefined();
    });

    it('should update report status to investigating', async () => {
      const response = await request(app)
        .put(`/api/v1/admin/reports/${reportId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          status: 'investigating',
          adminNotes: 'Starting investigation'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.report.status).toBe('investigating');
      expect(response.body.data.report.adminNotes).toBe('Starting investigation');
    });

    it('should resolve report', async () => {
      const response = await request(app)
        .put(`/api/v1/admin/reports/${reportId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          status: 'resolved',
          resolution: 'Warning issued to expert',
          adminNotes: 'Expert has been warned about professional conduct'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.report.status).toBe('resolved');
      expect(response.body.data.report.resolution).toBeDefined();
    });

    it('should dismiss report', async () => {
      const response = await request(app)
        .put(`/api/v1/admin/reports/${reportId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          status: 'dismissed',
          adminNotes: 'Report found to be unfounded'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.report.status).toBe('dismissed');
    });

    it('should escalate report', async () => {
      const response = await request(app)
        .put(`/api/v1/admin/reports/${reportId}/escalate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          severity: 'critical',
          escalationReason: 'Repeated violations'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.report.severity).toBe('critical');
    });
  });

  describe('System Analytics', () => {
    it('should get admin dashboard stats', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stats).toMatchObject({
        totalUsers: expect.any(Number),
        activeProjects: expect.any(Number),
        pendingReports: expect.any(Number),
        systemHealth: expect.any(String)
      });
    });

    it('should get user growth analytics', async () => {
      const response = await request(app)
        .get('/api/v1/admin/analytics/user-growth?timeRange=30d')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.userGrowth)).toBe(true);
    });

    it('should get revenue analytics', async () => {
      const response = await request(app)
        .get('/api/v1/admin/analytics/revenue?timeRange=30d')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.revenue).toBeDefined();
    });

    it('should get project analytics', async () => {
      const response = await request(app)
        .get('/api/v1/admin/analytics/projects?timeRange=30d')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.projects).toBeDefined();
    });

    it('should export analytics data', async () => {
      const response = await request(app)
        .post('/api/v1/admin/analytics/export')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          type: 'users',
          timeRange: '30d',
          format: 'csv'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.exportId).toBeDefined();
    });
  });

  describe('System Settings', () => {
    it('should get system settings', async () => {
      const response = await request(app)
        .get('/api/v1/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.settings).toBeDefined();
    });

    it('should update system settings', async () => {
      const settingsUpdate = {
        general: {
          siteName: 'AutomateHub Updated',
          maintenanceMode: false,
          registrationEnabled: true
        }
      };

      const response = await request(app)
        .put('/api/v1/admin/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(settingsUpdate)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.settings.general.siteName).toBe('AutomateHub Updated');
    });

    it('should test email configuration', async () => {
      const response = await request(app)
        .post('/api/v1/admin/settings/test-email')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ 
          recipient: 'test@example.com',
          subject: 'Test Email'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('email sent');
    });

    it('should backup database', async () => {
      const response = await request(app)
        .post('/api/v1/admin/system/backup')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.backupId).toBeDefined();
    });

    it('should get system health', async () => {
      const response = await request(app)
        .get('/api/v1/admin/system/health')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.health).toMatchObject({
        database: expect.any(String),
        server: expect.any(String),
        storage: expect.any(String)
      });
    });
  });

  describe('Audit Logs', () => {
    it('should get audit logs', async () => {
      const response = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.logs)).toBe(true);
    });

    it('should filter audit logs by action', async () => {
      const response = await request(app)
        .get('/api/v1/admin/audit-logs?action=user_suspended')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.logs)).toBe(true);
    });

    it('should filter audit logs by user', async () => {
      const response = await request(app)
        .get(`/api/v1/admin/audit-logs?userId=${expertId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.logs)).toBe(true);
    });

    it('should filter audit logs by date range', async () => {
      const response = await request(app)
        .get('/api/v1/admin/audit-logs?dateFrom=2024-01-01&dateTo=2024-12-31')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.logs)).toBe(true);
    });
  });

  describe('Access Control', () => {
    it('should prevent non-admin access to user management', async () => {
      await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${expertToken}`)
        .expect(403);
    });

    it('should prevent non-admin access to reports', async () => {
      await request(app)
        .get('/api/v1/admin/reports')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });

    it('should prevent non-admin access to system settings', async () => {
      await request(app)
        .get('/api/v1/admin/settings')
        .set('Authorization', `Bearer ${expertToken}`)
        .expect(403);
    });

    it('should prevent non-admin access to analytics', async () => {
      await request(app)
        .get('/api/v1/admin/analytics/user-growth')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });

    it('should require authentication for all admin endpoints', async () => {
      await request(app)
        .get('/api/v1/admin/users')
        .expect(401);
    });
  });
});
