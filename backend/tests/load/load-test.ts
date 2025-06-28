import request from 'supertest';
import { performance } from 'perf_hooks';
import app from '../../src/server';
import { createTestUser, createTestExpert, generateTestToken } from '../setup';

interface LoadTestResult {
  endpoint: string;
  method: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  errors: string[];
}

interface LoadTestConfig {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  concurrency: number;
  totalRequests: number;
  headers?: Record<string, string>;
  body?: any;
  description: string;
}

class LoadTester {
  private results: LoadTestResult[] = [];

  async runTest(config: LoadTestConfig): Promise<LoadTestResult> {
    console.log(`\n🚀 Starting load test: ${config.description}`);
    console.log(`📊 ${config.totalRequests} requests with ${config.concurrency} concurrent users`);

    const startTime = performance.now();
    const responseTimes: number[] = [];
    const errors: string[] = [];
    let successfulRequests = 0;
    let failedRequests = 0;

    // Create batches for concurrent execution
    const batchSize = config.concurrency;
    const batches = Math.ceil(config.totalRequests / batchSize);

    for (let batch = 0; batch < batches; batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, config.totalRequests);
      const batchRequests = batchEnd - batchStart;

      // Execute batch concurrently
      const promises = Array.from({ length: batchRequests }, () => 
        this.executeRequest(config, responseTimes, errors)
      );

      const results = await Promise.allSettled(promises);
      
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          successfulRequests++;
        } else {
          failedRequests++;
          if (result.status === 'rejected') {
            errors.push(result.reason?.message || 'Unknown error');
          }
        }
      });

      // Progress indicator
      const progress = ((batch + 1) / batches * 100).toFixed(1);
      process.stdout.write(`\r⏳ Progress: ${progress}% (${batchEnd}/${config.totalRequests})`);
    }

    const endTime = performance.now();
    const totalTime = (endTime - startTime) / 1000; // Convert to seconds

    const result: LoadTestResult = {
      endpoint: config.endpoint,
      method: config.method,
      totalRequests: config.totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime: responseTimes.length > 0 ? 
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0,
      minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
      maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
      requestsPerSecond: config.totalRequests / totalTime,
      errors: [...new Set(errors)] // Remove duplicates
    };

    this.results.push(result);
    console.log(`\n✅ Test completed in ${totalTime.toFixed(2)}s`);
    return result;
  }

  private async executeRequest(
    config: LoadTestConfig, 
    responseTimes: number[], 
    errors: string[]
  ): Promise<boolean> {
    try {
      const requestStart = performance.now();
      
      let response;
      switch (config.method) {
        case 'GET':
          response = await request(app)
            .get(config.endpoint)
            .set(config.headers || {});
          break;
        case 'POST':
          response = await request(app)
            .post(config.endpoint)
            .set(config.headers || {})
            .send(config.body || {});
          break;
        case 'PUT':
          response = await request(app)
            .put(config.endpoint)
            .set(config.headers || {})
            .send(config.body || {});
          break;
        case 'DELETE':
          response = await request(app)
            .delete(config.endpoint)
            .set(config.headers || {});
          break;
      }

      const requestEnd = performance.now();
      const responseTime = requestEnd - requestStart;
      responseTimes.push(responseTime);

      // Consider 2xx and 3xx as successful
      return response.status >= 200 && response.status < 400;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  generateReport(): string {
    let report = '\n' + '='.repeat(80) + '\n';
    report += '📊 LOAD TEST REPORT\n';
    report += '='.repeat(80) + '\n';

    this.results.forEach((result, index) => {
      report += `\n${index + 1}. ${result.method} ${result.endpoint}\n`;
      report += '-'.repeat(50) + '\n';
      report += `Total Requests: ${result.totalRequests}\n`;
      report += `Successful: ${result.successfulRequests} (${(result.successfulRequests / result.totalRequests * 100).toFixed(1)}%)\n`;
      report += `Failed: ${result.failedRequests} (${(result.failedRequests / result.totalRequests * 100).toFixed(1)}%)\n`;
      report += `Average Response Time: ${result.averageResponseTime.toFixed(2)}ms\n`;
      report += `Min Response Time: ${result.minResponseTime.toFixed(2)}ms\n`;
      report += `Max Response Time: ${result.maxResponseTime.toFixed(2)}ms\n`;
      report += `Requests/Second: ${result.requestsPerSecond.toFixed(2)}\n`;
      
      if (result.errors.length > 0) {
        report += `Errors:\n`;
        result.errors.slice(0, 5).forEach(error => {
          report += `  - ${error}\n`;
        });
        if (result.errors.length > 5) {
          report += `  ... and ${result.errors.length - 5} more errors\n`;
        }
      }
      report += '\n';
    });

    // Overall statistics
    const totalRequests = this.results.reduce((sum, r) => sum + r.totalRequests, 0);
    const totalSuccessful = this.results.reduce((sum, r) => sum + r.successfulRequests, 0);
    const avgResponseTime = this.results.reduce((sum, r) => sum + r.averageResponseTime, 0) / this.results.length;
    const avgRps = this.results.reduce((sum, r) => sum + r.requestsPerSecond, 0) / this.results.length;

    report += '='.repeat(80) + '\n';
    report += '📈 OVERALL STATISTICS\n';
    report += '='.repeat(80) + '\n';
    report += `Total Requests Across All Tests: ${totalRequests}\n`;
    report += `Overall Success Rate: ${(totalSuccessful / totalRequests * 100).toFixed(1)}%\n`;
    report += `Average Response Time: ${avgResponseTime.toFixed(2)}ms\n`;
    report += `Average Requests/Second: ${avgRps.toFixed(2)}\n`;

    return report;
  }

  getResults(): LoadTestResult[] {
    return this.results;
  }

  clear(): void {
    this.results = [];
  }
}

// Critical flow load tests
export async function runCriticalFlowLoadTests(): Promise<LoadTestResult[]> {
  const loadTester = new LoadTester();
  
  // Setup test data
  const testUser = await createTestUser({
    email: 'loadtest@example.com',
    role: 'client'
  });
  const expertData = await createTestExpert({
    email: 'expertload@example.com',
    role: 'expert'
  });
  const token = generateTestToken(testUser._id.toString());
  const expertToken = generateTestToken(expertData.user._id.toString());

  const authHeaders = { Authorization: `Bearer ${token}` };
  const expertAuthHeaders = { Authorization: `Bearer ${expertToken}` };

  // Test configurations for critical flows
  const testConfigs: LoadTestConfig[] = [
    {
      endpoint: '/health',
      method: 'GET',
      concurrency: 10,
      totalRequests: 100,
      description: 'Health Check Endpoint'
    },
    {
      endpoint: '/auth/login',
      method: 'POST',
      concurrency: 5,
      totalRequests: 50,
      body: {
        email: 'loadtest@example.com',
        password: 'password123'
      },
      description: 'User Authentication'
    },
    {
      endpoint: '/api/auth/me',
      method: 'GET',
      concurrency: 8,
      totalRequests: 80,
      headers: authHeaders,
      description: 'Get Current User Profile'
    },
    {
      endpoint: '/api/experts',
      method: 'GET',
      concurrency: 10,
      totalRequests: 100,
      headers: authHeaders,
      description: 'Expert Discovery/Search'
    },
    {
      endpoint: `/api/experts/${expertData.expert._id}`,
      method: 'GET',
      concurrency: 8,
      totalRequests: 80,
      headers: authHeaders,
      description: 'Expert Profile Details'
    },
    {
      endpoint: '/api/projects',
      method: 'GET',
      concurrency: 6,
      totalRequests: 60,
      headers: authHeaders,
      description: 'Project Listing'
    },
    {
      endpoint: '/api/projects',
      method: 'POST',
      concurrency: 3,
      totalRequests: 15,
      headers: authHeaders,
      body: {
        title: 'Load Test Project',
        description: 'Testing project creation under load',
        budget: { total: 1000, currency: 'USD' },
        startDate: new Date().toISOString(),
        expertId: expertData.expert._id.toString()
      },
      description: 'Project Creation'
    },
    {
      endpoint: '/api/conversations',
      method: 'GET',
      concurrency: 5,
      totalRequests: 50,
      headers: authHeaders,
      description: 'Conversation Listing'
    }
  ];

  // Run all tests
  for (const config of testConfigs) {
    await loadTester.runTest(config);
    // Small delay between tests to avoid overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(loadTester.generateReport());
  return loadTester.getResults();
}

export { LoadTester, LoadTestResult, LoadTestConfig };
