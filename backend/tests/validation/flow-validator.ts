import request from 'supertest';
import app from '../../src/server';
import { createTestUser, createTestExpert, generateTestToken } from '../setup';

interface ValidationResult {
  flow: string;
  steps: StepResult[];
  success: boolean;
  totalTime: number;
  errors: string[];
}

interface StepResult {
  step: string;
  success: boolean;
  responseTime: number;
  statusCode?: number;
  error?: string;
}

export class FlowValidator {
  public results: ValidationResult[] = [];

  async validateAuthenticationFlow(): Promise<ValidationResult> {
    const startTime = Date.now();
    const steps: StepResult[] = [];
    const errors: string[] = [];

    try {
      // Step 1: Register new user
      const registerStart = Date.now();
      const registerResponse = await request(app)
        .post('/auth/register')
        .send({
          email: 'flowtest@example.com',
          password: 'password123',
          firstName: 'Flow',
          lastName: 'Test',
          role: 'client'
        });

      steps.push({
        step: 'User Registration',
        success: registerResponse.status === 201,
        responseTime: Date.now() - registerStart,
        statusCode: registerResponse.status,
        error: registerResponse.status !== 201 ? registerResponse.body.message : undefined
      });

      if (registerResponse.status !== 201) {
        errors.push(`Registration failed: ${registerResponse.body.message}`);
      }

      const token = registerResponse.body.data?.token;

      // Step 2: Login with credentials
      const loginStart = Date.now();
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'flowtest@example.com',
          password: 'password123'
        });

      steps.push({
        step: 'User Login',
        success: loginResponse.status === 200,
        responseTime: Date.now() - loginStart,
        statusCode: loginResponse.status,
        error: loginResponse.status !== 200 ? loginResponse.body.message : undefined
      });

      // Step 3: Access protected profile
      const profileStart = Date.now();
      const profileResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      steps.push({
        step: 'Profile Access',
        success: profileResponse.status === 200,
        responseTime: Date.now() - profileStart,
        statusCode: profileResponse.status,
        error: profileResponse.status !== 200 ? profileResponse.body.message : undefined
      });

    } catch (error) {
      errors.push(`Authentication flow error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const result: ValidationResult = {
      flow: 'Authentication Flow',
      steps,
      success: steps.every(step => step.success) && errors.length === 0,
      totalTime: Date.now() - startTime,
      errors
    };

    this.results.push(result);
    return result;
  }

  async validateProjectManagementFlow(): Promise<ValidationResult> {
    const startTime = Date.now();
    const steps: StepResult[] = [];
    const errors: string[] = [];

    try {
      // Setup test data
      const client = await createTestUser({ email: 'projectclient@example.com', role: 'client' });
      const expertData = await createTestExpert({ email: 'projectexpert@example.com', role: 'expert' });
      const clientToken = generateTestToken(client._id.toString());
      const expertToken = generateTestToken(expertData.user._id.toString());

      // Step 1: Create project
      const createStart = Date.now();
      const createResponse = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          title: 'Validation Test Project',
          description: 'Testing project management flow',
          budget: { total: 2000, currency: 'USD' },
          startDate: new Date().toISOString(),
          expertId: expertData.expert._id.toString()
        });

      steps.push({
        step: 'Project Creation',
        success: createResponse.status === 201,
        responseTime: Date.now() - createStart,
        statusCode: createResponse.status
      });

      const projectId = createResponse.body.data?.project._id;

      // Step 2: Expert accepts project
      const acceptStart = Date.now();
      const acceptResponse = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${expertToken}`)
        .send({ status: 'in_progress' });

      steps.push({
        step: 'Project Acceptance',
        success: acceptResponse.status === 200,
        responseTime: Date.now() - acceptStart,
        statusCode: acceptResponse.status
      });

      // Step 3: Update progress
      const progressStart = Date.now();
      const progressResponse = await request(app)
        .put(`/api/projects/${projectId}/progress`)
        .set('Authorization', `Bearer ${expertToken}`)
        .send({ progress: 50 });

      steps.push({
        step: 'Progress Update',
        success: progressResponse.status === 200,
        responseTime: Date.now() - progressStart,
        statusCode: progressResponse.status
      });

    } catch (error) {
      errors.push(`Project flow error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const result: ValidationResult = {
      flow: 'Project Management Flow',
      steps,
      success: steps.every(step => step.success) && errors.length === 0,
      totalTime: Date.now() - startTime,
      errors
    };

    this.results.push(result);
    return result;
  }

  generateValidationReport(): string {
    let report = '\n' + '='.repeat(80) + '\n';
    report += '✅ CRITICAL FLOW VALIDATION REPORT\n';
    report += '='.repeat(80) + '\n';

    this.results.forEach((result, index) => {
      const status = result.success ? '✅ PASSED' : '❌ FAILED';
      report += `\n${index + 1}. ${result.flow} - ${status}\n`;
      report += '-'.repeat(50) + '\n';
      report += `Total Time: ${result.totalTime}ms\n`;
      report += `Steps: ${result.steps.length}\n`;
      report += `Success Rate: ${(result.steps.filter(s => s.success).length / result.steps.length * 100).toFixed(1)}%\n\n`;

      result.steps.forEach((step, stepIndex) => {
        const stepStatus = step.success ? '✅' : '❌';
        report += `  ${stepIndex + 1}. ${stepStatus} ${step.step} (${step.responseTime}ms)\n`;
        if (step.error) {
          report += `     Error: ${step.error}\n`;
        }
      });

      if (result.errors.length > 0) {
        report += '\n  Errors:\n';
        result.errors.forEach(error => {
          report += `    - ${error}\n`;
        });
      }
      report += '\n';
    });

    return report;
  }
}

export async function runCriticalFlowValidation(): Promise<ValidationResult[]> {
  const validator = new FlowValidator();
  
  console.log('🔍 Running critical flow validation...');
  
  await validator.validateAuthenticationFlow();
  await validator.validateProjectManagementFlow();
  
  console.log(validator.generateValidationReport());
  return validator.results;
}
