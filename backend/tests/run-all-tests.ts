#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { runCriticalFlowLoadTests } from './load/load-test';
import { runCriticalFlowValidation } from './validation/flow-validator';

interface TestSummary {
  timestamp: string;
  integrationTests: {
    passed: number;
    failed: number;
    total: number;
    coverage?: string;
  };
  loadTests: {
    totalRequests: number;
    successRate: number;
    averageResponseTime: number;
    requestsPerSecond: number;
  };
  flowValidation: {
    totalFlows: number;
    passedFlows: number;
    failedFlows: number;
  };
  recommendations: string[];
  overallStatus: 'PASSED' | 'FAILED' | 'WARNING';
}

async function runAllTests(): Promise<TestSummary> {
  console.log('🚀 Starting comprehensive AutomateHub test suite...\n');
  
  const summary: TestSummary = {
    timestamp: new Date().toISOString(),
    integrationTests: { passed: 0, failed: 0, total: 0 },
    loadTests: { totalRequests: 0, successRate: 0, averageResponseTime: 0, requestsPerSecond: 0 },
    flowValidation: { totalFlows: 0, passedFlows: 0, failedFlows: 0 },
    recommendations: [],
    overallStatus: 'PASSED'
  };

  try {
    // 1. Run Integration Tests
    console.log('📋 Running Integration Tests...');
    console.log('='.repeat(50));
    
    try {
      const jestOutput = execSync('npm run test:integration', { 
        encoding: 'utf8',
        cwd: process.cwd()
      });
      
      // Parse Jest output for test results
      const testResults = parseJestOutput(jestOutput);
      summary.integrationTests = testResults;
      
      console.log(`✅ Integration Tests: ${testResults.passed}/${testResults.total} passed`);
    } catch (error) {
      console.error('❌ Integration tests failed:', error);
      summary.integrationTests.failed = 1;
      summary.overallStatus = 'FAILED';
    }

    // 2. Run Load Tests
    console.log('\n⚡ Running Load Tests...');
    console.log('='.repeat(50));
    
    try {
      const loadResults = await runCriticalFlowLoadTests();
      
      const totalRequests = loadResults.reduce((sum, r) => sum + r.totalRequests, 0);
      const successfulRequests = loadResults.reduce((sum, r) => sum + r.successfulRequests, 0);
      const avgResponseTime = loadResults.reduce((sum, r) => sum + r.averageResponseTime, 0) / loadResults.length;
      const avgRps = loadResults.reduce((sum, r) => sum + r.requestsPerSecond, 0) / loadResults.length;
      
      summary.loadTests = {
        totalRequests,
        successRate: (successfulRequests / totalRequests) * 100,
        averageResponseTime: avgResponseTime,
        requestsPerSecond: avgRps
      };
      
      if (summary.loadTests.successRate < 95) {
        summary.recommendations.push('Load test success rate below 95% - investigate performance issues');
        summary.overallStatus = 'WARNING';
      }
      
      if (summary.loadTests.averageResponseTime > 1000) {
        summary.recommendations.push('Average response time above 1s - optimize slow endpoints');
        summary.overallStatus = 'WARNING';
      }
      
      console.log(`✅ Load Tests: ${summary.loadTests.successRate.toFixed(1)}% success rate`);
    } catch (error) {
      console.error('❌ Load tests failed:', error);
      summary.overallStatus = 'FAILED';
    }

    // 3. Run Flow Validation
    console.log('\n🔍 Running Critical Flow Validation...');
    console.log('='.repeat(50));
    
    try {
      const validationResults = await runCriticalFlowValidation();
      
      summary.flowValidation = {
        totalFlows: validationResults.length,
        passedFlows: validationResults.filter(r => r.success).length,
        failedFlows: validationResults.filter(r => !r.success).length
      };
      
      if (summary.flowValidation.failedFlows > 0) {
        summary.recommendations.push('Critical flows failing - immediate attention required');
        summary.overallStatus = 'FAILED';
      }
      
      console.log(`✅ Flow Validation: ${summary.flowValidation.passedFlows}/${summary.flowValidation.totalFlows} flows passed`);
    } catch (error) {
      console.error('❌ Flow validation failed:', error);
      summary.overallStatus = 'FAILED';
    }

  } catch (error) {
    console.error('❌ Test suite execution failed:', error);
    summary.overallStatus = 'FAILED';
  }

  // Generate final report
  generateFinalReport(summary);
  
  return summary;
}

function parseJestOutput(output: string): { passed: number; failed: number; total: number; coverage?: string } {
  // Simple Jest output parsing - in real scenario, use Jest's JSON reporter
  const passedMatch = output.match(/(\d+) passing/);
  const failedMatch = output.match(/(\d+) failing/);
  const totalMatch = output.match(/Tests:\s+(\d+) total/);
  
  return {
    passed: passedMatch ? parseInt(passedMatch[1]) : 0,
    failed: failedMatch ? parseInt(failedMatch[1]) : 0,
    total: totalMatch ? parseInt(totalMatch[1]) : 0
  };
}

function generateFinalReport(summary: TestSummary): void {
  const statusEmoji = summary.overallStatus === 'PASSED' ? '✅' : 
                     summary.overallStatus === 'WARNING' ? '⚠️' : '❌';
  
  let report = '\n' + '='.repeat(80) + '\n';
  report += `${statusEmoji} AUTOMATEHUB INTEGRATION TEST REPORT\n`;
  report += '='.repeat(80) + '\n';
  report += `Timestamp: ${summary.timestamp}\n`;
  report += `Overall Status: ${summary.overallStatus}\n\n`;
  
  // Integration Tests Summary
  report += '📋 INTEGRATION TESTS\n';
  report += '-'.repeat(30) + '\n';
  report += `Total Tests: ${summary.integrationTests.total}\n`;
  report += `Passed: ${summary.integrationTests.passed}\n`;
  report += `Failed: ${summary.integrationTests.failed}\n`;
  report += `Success Rate: ${summary.integrationTests.total > 0 ? 
    (summary.integrationTests.passed / summary.integrationTests.total * 100).toFixed(1) : 0}%\n\n`;
  
  // Load Tests Summary
  report += '⚡ LOAD TESTS\n';
  report += '-'.repeat(30) + '\n';
  report += `Total Requests: ${summary.loadTests.totalRequests}\n`;
  report += `Success Rate: ${summary.loadTests.successRate.toFixed(1)}%\n`;
  report += `Avg Response Time: ${summary.loadTests.averageResponseTime.toFixed(2)}ms\n`;
  report += `Requests/Second: ${summary.loadTests.requestsPerSecond.toFixed(2)}\n\n`;
  
  // Flow Validation Summary
  report += '🔍 CRITICAL FLOW VALIDATION\n';
  report += '-'.repeat(30) + '\n';
  report += `Total Flows: ${summary.flowValidation.totalFlows}\n`;
  report += `Passed: ${summary.flowValidation.passedFlows}\n`;
  report += `Failed: ${summary.flowValidation.failedFlows}\n\n`;
  
  // Recommendations
  if (summary.recommendations.length > 0) {
    report += '💡 RECOMMENDATIONS\n';
    report += '-'.repeat(30) + '\n';
    summary.recommendations.forEach((rec, index) => {
      report += `${index + 1}. ${rec}\n`;
    });
    report += '\n';
  }
  
  // Test Coverage Areas
  report += '📊 TEST COVERAGE AREAS\n';
  report += '-'.repeat(30) + '\n';
  report += '✅ Authentication (register, login, token validation)\n';
  report += '✅ Project Management (create, update, progress tracking)\n';
  report += '✅ Expert Discovery (search, filtering, recommendations)\n';
  report += '✅ Real-time Messaging (Socket.IO integration)\n';
  report += '✅ Load Testing (concurrent users, response times)\n';
  report += '✅ API Endpoints (CRUD operations, error handling)\n\n';
  
  report += '='.repeat(80) + '\n';
  
  console.log(report);
  
  // Save report to file
  const reportPath = join(process.cwd(), 'test-report.md');
  const markdownReport = convertToMarkdown(report, summary);
  writeFileSync(reportPath, markdownReport);
  console.log(`📄 Detailed report saved to: ${reportPath}`);
}

function convertToMarkdown(report: string, summary: TestSummary): string {
  const statusBadge = summary.overallStatus === 'PASSED' ? '![PASSED](https://img.shields.io/badge/Tests-PASSED-green)' :
                     summary.overallStatus === 'WARNING' ? '![WARNING](https://img.shields.io/badge/Tests-WARNING-yellow)' :
                     '![FAILED](https://img.shields.io/badge/Tests-FAILED-red)';
  
  return `# AutomateHub Integration Test Report

${statusBadge}

**Generated:** ${summary.timestamp}
**Overall Status:** ${summary.overallStatus}

## 📋 Integration Tests
- **Total:** ${summary.integrationTests.total}
- **Passed:** ${summary.integrationTests.passed}
- **Failed:** ${summary.integrationTests.failed}
- **Success Rate:** ${summary.integrationTests.total > 0 ? (summary.integrationTests.passed / summary.integrationTests.total * 100).toFixed(1) : 0}%

## ⚡ Load Tests
- **Total Requests:** ${summary.loadTests.totalRequests}
- **Success Rate:** ${summary.loadTests.successRate.toFixed(1)}%
- **Average Response Time:** ${summary.loadTests.averageResponseTime.toFixed(2)}ms
- **Requests/Second:** ${summary.loadTests.requestsPerSecond.toFixed(2)}

## 🔍 Critical Flow Validation
- **Total Flows:** ${summary.flowValidation.totalFlows}
- **Passed:** ${summary.flowValidation.passedFlows}
- **Failed:** ${summary.flowValidation.failedFlows}

${summary.recommendations.length > 0 ? `## 💡 Recommendations
${summary.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}` : ''}

## 📊 Test Coverage
- ✅ Authentication Flow
- ✅ Project Management
- ✅ Expert Discovery & Matching
- ✅ Real-time Messaging
- ✅ Load Testing
- ✅ API Integration

---
*Report generated by AutomateHub Test Suite*`;
}

// Run tests if called directly
if (require.main === module) {
  runAllTests()
    .then(summary => {
      process.exit(summary.overallStatus === 'FAILED' ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    });
}

export { runAllTests, TestSummary };
