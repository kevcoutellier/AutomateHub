#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 AutomateHub Test Coverage Improvement Script');
console.log('================================================\n');

// Function to run command and capture output
function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    console.log(`✅ ${description} completed successfully\n`);
    return output;
  } catch (error) {
    console.log(`❌ ${description} failed:`);
    console.log(error.stdout || error.message);
    console.log('');
    return null;
  }
}

// Function to create directory if it doesn't exist
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

// Main improvement process
async function improveTestCoverage() {
  console.log('🔍 Analyzing current test structure...\n');

  // Ensure test directories exist
  ensureDir('tests/unit');
  ensureDir('tests/integration');
  ensureDir('tests/e2e');

  // Check if unit tests exist
  const unitTestsExist = fs.existsSync('tests/unit/auth.unit.test.ts');
  console.log(`📊 Unit tests status: ${unitTestsExist ? '✅ Present' : '❌ Missing'}`);

  // Run unit tests first
  console.log('\n🧪 Running Unit Tests...');
  const unitTestResult = runCommand(
    'npx jest tests/unit --coverage --testTimeout=10000',
    'Unit test execution'
  );

  // Run integration tests
  console.log('🔗 Running Integration Tests...');
  const integrationTestResult = runCommand(
    'npx jest tests/integration --coverage --testTimeout=30000',
    'Integration test execution'
  );

  // Generate comprehensive coverage report
  console.log('📊 Generating comprehensive coverage report...');
  const coverageResult = runCommand(
    'npx jest --coverage --coverageReporters=text --coverageReporters=html --coverageReporters=json',
    'Coverage report generation'
  );

  // Analyze coverage data
  if (fs.existsSync('coverage/coverage-final.json')) {
    const coverageData = JSON.parse(fs.readFileSync('coverage/coverage-final.json', 'utf8'));
    
    console.log('\n📈 Coverage Analysis:');
    console.log('====================');
    
    let totalStatements = 0;
    let coveredStatements = 0;
    let totalFunctions = 0;
    let coveredFunctions = 0;
    let totalBranches = 0;
    let coveredBranches = 0;
    let totalLines = 0;
    let coveredLines = 0;

    Object.values(coverageData).forEach(file => {
      totalStatements += file.s ? Object.keys(file.s).length : 0;
      coveredStatements += file.s ? Object.values(file.s).filter(v => v > 0).length : 0;
      
      totalFunctions += file.f ? Object.keys(file.f).length : 0;
      coveredFunctions += file.f ? Object.values(file.f).filter(v => v > 0).length : 0;
      
      totalBranches += file.b ? Object.keys(file.b).length : 0;
      coveredBranches += file.b ? Object.values(file.b).filter(branch => branch.some(v => v > 0)).length : 0;
      
      if (file.statementMap) {
        totalLines += Object.keys(file.statementMap).length;
        coveredLines += Object.keys(file.statementMap).filter(key => file.s[key] > 0).length;
      }
    });

    const statementCoverage = totalStatements > 0 ? (coveredStatements / totalStatements * 100).toFixed(2) : 0;
    const functionCoverage = totalFunctions > 0 ? (coveredFunctions / totalFunctions * 100).toFixed(2) : 0;
    const branchCoverage = totalBranches > 0 ? (coveredBranches / totalBranches * 100).toFixed(2) : 0;
    const lineCoverage = totalLines > 0 ? (coveredLines / totalLines * 100).toFixed(2) : 0;

    console.log(`📊 Statement Coverage: ${statementCoverage}% (${coveredStatements}/${totalStatements})`);
    console.log(`🔧 Function Coverage: ${functionCoverage}% (${coveredFunctions}/${totalFunctions})`);
    console.log(`🌿 Branch Coverage: ${branchCoverage}% (${coveredBranches}/${totalBranches})`);
    console.log(`📝 Line Coverage: ${lineCoverage}% (${coveredLines}/${totalLines})`);
  }

  // Generate improvement recommendations
  console.log('\n💡 Test Coverage Improvement Recommendations:');
  console.log('============================================');

  const recommendations = [
    {
      area: 'Routes Coverage',
      current: '16.92%',
      target: '80%',
      actions: [
        'Add comprehensive unit tests for all route handlers',
        'Test error handling and edge cases',
        'Validate request/response formats',
        'Test authentication and authorization'
      ]
    },
    {
      area: 'Services Coverage',
      current: '8.01%',
      target: '90%',
      actions: [
        'Test all service methods with various inputs',
        'Mock external dependencies',
        'Test error scenarios and edge cases',
        'Validate business logic thoroughly'
      ]
    },
    {
      area: 'Models Coverage',
      current: '51.76%',
      target: '85%',
      actions: [
        'Test model validations and constraints',
        'Test pre/post hooks and middleware',
        'Validate schema requirements',
        'Test model relationships and population'
      ]
    },
    {
      area: 'Middleware Coverage',
      current: '32.03%',
      target: '95%',
      actions: [
        'Test authentication middleware thoroughly',
        'Test validation middleware with various inputs',
        'Test error handling middleware',
        'Test rate limiting and security middleware'
      ]
    }
  ];

  recommendations.forEach((rec, index) => {
    console.log(`\n${index + 1}. ${rec.area}`);
    console.log(`   Current: ${rec.current} → Target: ${rec.target}`);
    rec.actions.forEach(action => {
      console.log(`   • ${action}`);
    });
  });

  // Create test improvement plan
  const improvementPlan = {
    timestamp: new Date().toISOString(),
    currentCoverage: {
      statements: unitTestResult ? 'Improved with unit tests' : 'Needs unit tests',
      integration: integrationTestResult ? 'Integration tests running' : 'Integration tests need fixes'
    },
    recommendations,
    nextSteps: [
      'Run individual test files to identify specific failures',
      'Fix database connection issues in integration tests',
      'Add more unit tests for uncovered functions',
      'Implement E2E tests for critical user journeys',
      'Set up CI/CD pipeline with coverage thresholds'
    ]
  };

  fs.writeFileSync(
    'coverage/improvement-plan.json',
    JSON.stringify(improvementPlan, null, 2)
  );

  console.log('\n📋 Test Improvement Plan saved to coverage/improvement-plan.json');
  
  // Generate test commands for easy execution
  const testCommands = {
    'Run all unit tests': 'npm run test:unit',
    'Run specific unit test': 'npx jest tests/unit/auth.unit.test.ts',
    'Run integration tests': 'npm run test:integration',
    'Run with coverage': 'npm test -- --coverage',
    'Run specific route tests': 'npx jest tests/unit --testNamePattern="Auth Routes"',
    'Debug failing tests': 'npx jest --detectOpenHandles --forceExit'
  };

  console.log('\n🛠️  Useful Test Commands:');
  console.log('========================');
  Object.entries(testCommands).forEach(([description, command]) => {
    console.log(`${description}:`);
    console.log(`  ${command}\n`);
  });

  console.log('✨ Test coverage improvement analysis complete!');
  console.log('📁 Check the coverage/ directory for detailed reports');
  console.log('🎯 Focus on the recommendations above to improve coverage\n');
}

// Run the improvement process
improveTestCoverage().catch(error => {
  console.error('❌ Error during test coverage improvement:', error);
  process.exit(1);
});
