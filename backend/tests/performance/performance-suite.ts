#!/usr/bin/env ts-node

import { performance } from 'perf_hooks';
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';
import request from 'supertest';
import app from '../../src/server';

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  successRate: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
}

interface LoadTestConfig {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  concurrency: number;
  totalRequests: number;
  headers?: Record<string, string>;
  body?: any;
  description: string;
  expectedResponseTime?: number; // in ms
  expectedSuccessRate?: number; // percentage
}

class PerformanceTester {
  private results: PerformanceMetrics[] = [];
  private testToken: string = '';

  async initialize(): Promise<void> {
    console.log('🔧 Initializing performance test environment...');
    
    // Create test user and get token
    const testUser = {
      email: 'perf.test@automatehub.com',
      password: 'TestPassword123!',
      firstName: 'Performance',
      lastName: 'Tester',
      role: 'client'
    };

    try {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      if (response.status === 201 || response.status === 409) {
        // Login to get token
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password
          });
        
        this.testToken = loginResponse.body.token;
        console.log('✅ Test environment initialized');
      }
    } catch (error) {
      console.warn('⚠️  Using tests without authentication');
    }
  }

  async runLoadTest(config: LoadTestConfig): Promise<PerformanceMetrics> {
    console.log(`\n🚀 Load Test: ${config.description}`);
    console.log(`📊 ${config.totalRequests} requests, ${config.concurrency} concurrent`);
    
    const startTime = performance.now();
    const startCpuUsage = process.cpuUsage();
    const startMemory = process.memoryUsage();
    
    const responseTimes: number[] = [];
    let successfulRequests = 0;
    let failedRequests = 0;

    // Execute requests in batches for controlled concurrency
    const batchSize = config.concurrency;
    const batches = Math.ceil(config.totalRequests / batchSize);

    for (let batch = 0; batch < batches; batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, config.totalRequests);
      const batchRequests = batchEnd - batchStart;

      const promises = Array.from({ length: batchRequests }, () => 
        this.executeRequest(config)
      );

      const results = await Promise.allSettled(promises);
      
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          const { success, responseTime } = result.value;
          if (success) {
            successfulRequests++;
            responseTimes.push(responseTime);
          } else {
            failedRequests++;
          }
        } else {
          failedRequests++;
        }
      });

      // Progress indicator
      const progress = ((batch + 1) / batches * 100).toFixed(1);
      process.stdout.write(`\r⏳ Progress: ${progress}%`);
    }

    const endTime = performance.now();
    const endCpuUsage = process.cpuUsage(startCpuUsage);
    const endMemory = process.memoryUsage();
    
    const totalTime = (endTime - startTime) / 1000; // seconds
    
    const metrics: PerformanceMetrics = {
      endpoint: config.endpoint,
      method: config.method,
      averageResponseTime: responseTimes.length > 0 ? 
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0,
      minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
      maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
      requestsPerSecond: config.totalRequests / totalTime,
      successRate: (successfulRequests / config.totalRequests) * 100,
      memoryUsage: {
        rss: endMemory.rss - startMemory.rss,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        external: endMemory.external - startMemory.external,
        arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers
      },
      cpuUsage: endCpuUsage
    };

    this.results.push(metrics);
    this.printTestResult(metrics, config);
    
    return metrics;
  }

  private async executeRequest(config: LoadTestConfig): Promise<{ success: boolean; responseTime: number }> {
    const startTime = performance.now();
    
    try {
      let req = request(app)[config.method.toLowerCase() as keyof typeof request];
      
      if (this.testToken && config.headers) {
        config.headers.Authorization = `Bearer ${this.testToken}`;
      }
      
      if (config.headers) {
        Object.entries(config.headers).forEach(([key, value]) => {
          req = req.set(key, value);
        });
      }
      
      if (config.body) {
        req = req.send(config.body);
      }
      
      const response = await req;
      const endTime = performance.now();
      
      return {
        success: response.status >= 200 && response.status < 400,
        responseTime: endTime - startTime
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        success: false,
        responseTime: endTime - startTime
      };
    }
  }

  private printTestResult(metrics: PerformanceMetrics, config: LoadTestConfig): void {
    console.log(`\n📈 Results for ${config.endpoint}:`);
    console.log(`   Success Rate: ${metrics.successRate.toFixed(2)}%`);
    console.log(`   Avg Response Time: ${metrics.averageResponseTime.toFixed(2)}ms`);
    console.log(`   Min/Max: ${metrics.minResponseTime.toFixed(2)}ms / ${metrics.maxResponseTime.toFixed(2)}ms`);
    console.log(`   Requests/sec: ${metrics.requestsPerSecond.toFixed(2)}`);
    console.log(`   Memory Delta: ${(metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    
    // Performance validation
    const warnings: string[] = [];
    
    if (config.expectedResponseTime && metrics.averageResponseTime > config.expectedResponseTime) {
      warnings.push(`⚠️  Response time ${metrics.averageResponseTime.toFixed(2)}ms exceeds expected ${config.expectedResponseTime}ms`);
    }
    
    if (config.expectedSuccessRate && metrics.successRate < config.expectedSuccessRate) {
      warnings.push(`⚠️  Success rate ${metrics.successRate.toFixed(2)}% below expected ${config.expectedSuccessRate}%`);
    }
    
    if (metrics.requestsPerSecond < 10) {
      warnings.push(`⚠️  Low throughput: ${metrics.requestsPerSecond.toFixed(2)} req/s`);
    }
    
    if (warnings.length > 0) {
      console.log(`   ${warnings.join('\n   ')}`);
    } else {
      console.log(`   ✅ Performance targets met`);
    }
  }

  generateReport(): void {
    console.log('\n📊 PERFORMANCE TEST SUMMARY');
    console.log('='.repeat(60));
    
    const overallMetrics = {
      totalTests: this.results.length,
      averageSuccessRate: this.results.reduce((sum, r) => sum + r.successRate, 0) / this.results.length,
      averageResponseTime: this.results.reduce((sum, r) => sum + r.averageResponseTime, 0) / this.results.length,
      totalRequestsPerSecond: this.results.reduce((sum, r) => sum + r.requestsPerSecond, 0),
      totalMemoryUsed: this.results.reduce((sum, r) => sum + r.memoryUsage.heapUsed, 0) / 1024 / 1024
    };
    
    console.log(`Total Tests: ${overallMetrics.totalTests}`);
    console.log(`Overall Success Rate: ${overallMetrics.averageSuccessRate.toFixed(2)}%`);
    console.log(`Average Response Time: ${overallMetrics.averageResponseTime.toFixed(2)}ms`);
    console.log(`Combined Throughput: ${overallMetrics.totalRequestsPerSecond.toFixed(2)} req/s`);
    console.log(`Total Memory Usage: ${overallMetrics.totalMemoryUsed.toFixed(2)}MB`);
    
    // Generate detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: overallMetrics,
      detailedResults: this.results,
      recommendations: this.generateRecommendations(overallMetrics)
    };
    
    const reportPath = join(__dirname, '../reports/performance-report.json');
    writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }

  private generateRecommendations(metrics: any): string[] {
    const recommendations: string[] = [];
    
    if (metrics.averageSuccessRate < 95) {
      recommendations.push('Consider improving error handling and API stability');
    }
    
    if (metrics.averageResponseTime > 500) {
      recommendations.push('Optimize database queries and add caching layers');
    }
    
    if (metrics.totalRequestsPerSecond < 50) {
      recommendations.push('Consider implementing connection pooling and load balancing');
    }
    
    if (metrics.totalMemoryUsed > 100) {
      recommendations.push('Review memory usage patterns and implement garbage collection optimization');
    }
    
    return recommendations;
  }
}

// Test configurations for critical endpoints
const testConfigs: LoadTestConfig[] = [
  {
    endpoint: '/api/experts',
    method: 'GET',
    concurrency: 10,
    totalRequests: 100,
    description: 'Expert Discovery - High Load',
    expectedResponseTime: 300,
    expectedSuccessRate: 95
  },
  {
    endpoint: '/api/experts?search=automation&specialty=e-commerce',
    method: 'GET',
    concurrency: 8,
    totalRequests: 80,
    description: 'Expert Search with Filters',
    expectedResponseTime: 500,
    expectedSuccessRate: 95
  },
  {
    endpoint: '/api/projects',
    method: 'GET',
    concurrency: 5,
    totalRequests: 50,
    headers: { 'Content-Type': 'application/json' },
    description: 'Project Listing - Authenticated',
    expectedResponseTime: 400,
    expectedSuccessRate: 90
  },
  {
    endpoint: '/api/conversations',
    method: 'GET',
    concurrency: 5,
    totalRequests: 50,
    headers: { 'Content-Type': 'application/json' },
    description: 'Messaging System Load',
    expectedResponseTime: 300,
    expectedSuccessRate: 90
  },
  {
    endpoint: '/api/analytics',
    method: 'GET',
    concurrency: 3,
    totalRequests: 30,
    headers: { 'Content-Type': 'application/json' },
    description: 'Analytics Dashboard',
    expectedResponseTime: 800,
    expectedSuccessRate: 85
  }
];

async function runPerformanceTests(): Promise<void> {
  const tester = new PerformanceTester();
  
  try {
    await tester.initialize();
    
    console.log('\n🎯 Starting Performance Test Suite');
    console.log('='.repeat(60));
    
    for (const config of testConfigs) {
      await tester.runLoadTest(config);
      
      // Brief pause between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    tester.generateReport();
    
    console.log('\n✅ Performance testing completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Performance testing failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runPerformanceTests();
}

export { runPerformanceTests, PerformanceTester };
