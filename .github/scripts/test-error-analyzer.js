import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { ERROR_PATTERNS } from './analyze-workflow-errors.js';

// Test data generator for each error pattern
function generateTestData() {
  const testCases = [];
  const testDir = 'test-workflow-logs';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // Create test logs directory structure
  mkdirSync(join(testDir, 'angular-tests', `run-${timestamp}`), { recursive: true });
  mkdirSync(join(testDir, 'server-tests', `run-${timestamp}`), { recursive: true });
  
  // Generate test cases for each error pattern
  ERROR_PATTERNS.forEach((pattern, index) => {
    const testCase = {
      workflow: index % 2 === 0 ? 'angular-tests' : 'server-tests',
      job: `test-job-${index}`,
      error: pattern,
      logContent: `
=== Starting job ===
[2025-05-18T10:00:00.000Z] Setting up environment
[2025-05-18T10:00:01.000Z] Running tests...
[2025-05-18T10:00:02.000Z] ERROR: ${generateErrorMessage(pattern)}
[2025-05-18T10:00:03.000Z] Job failed with status 1
=== End of job ===
`
    };
    testCases.push(testCase);
    
    // Write test log file
    const logPath = join(testDir, testCase.workflow, `run-${timestamp}`, `${testCase.job}.txt`);
    writeFileSync(logPath, testCase.logContent);
  });

  // Write metadata files
  writeFileSync(
    join(testDir, 'angular-tests', `run-${timestamp}`, 'metadata.json'),
    JSON.stringify({
      workflow_name: 'angular-tests',
      run_id: timestamp,
      status: 'failed',
      created_at: new Date().toISOString()
    }, null, 2)
  );

  writeFileSync(
    join(testDir, 'server-tests', `run-${timestamp}`, 'metadata.json'),
    JSON.stringify({
      workflow_name: 'server-tests',
      run_id: timestamp,
      status: 'failed',
      created_at: new Date().toISOString()
    }, null, 2)
  );

  return testCases;
}

// Generate error message from pattern
function generateErrorMessage(errorPattern) {
  switch (errorPattern.name) {
    case 'Husky Not Found':
      return 'sh: 1: husky: not found';
    case 'Angular Router Error':
      return 'Error: Cannot read properties of undefined (reading \'root\')';
    case 'SCSS Deprecation Warning':
      return '@import rule is deprecated. Use @use instead.';
    case 'HTTP Test Error':
      return 'Error: HttpTestingController expected one request but found none';
    case 'Missing QR Code Module':
      return 'Error: Cannot find module \'angularx-qrcode\'';
    case 'TypeScript Type Error':
      return 'Error: Type \'string\' is not assignable to type \'number\'';
    case 'MongoDB Connection Error':
      return 'MongoServerError: failed to connect to server';
    case 'Disk Space Error':
      return 'ENOSPC: no space left on device';
    default:
      return `Error matching pattern: ${errorPattern.pattern.toString()}`;
  }
}

// Run tests
console.log('=== Running Error Analyzer Tests ===');
console.log('Generating test data...');
const testCases = generateTestData();

console.log(`Generated ${testCases.length} test cases`);
console.log('Running error analyzer...');

// Import and run analyzer
import('./analyze-workflow-errors.js').then(analyzer => {
  try {
    const results = analyzer.analyzeLogFiles('test-workflow-logs');
    
    // Validate results
    const errors = [];
    let passedTests = 0;

    testCases.forEach(testCase => {
      const workflowResults = results[testCase.workflow];
      if (!workflowResults) {
        errors.push(`No results found for workflow: ${testCase.workflow}`);
        return;
      }

      const foundError = Object.values(workflowResults)
        .some(run => run.errors.some(err => err.name === testCase.error.name));

      if (!foundError) {
        errors.push(`Failed to detect error pattern: ${testCase.error.name}`);
      } else {
        passedTests++;
      }
    });

    // Print results
    console.log('\n=== Test Results ===');
    console.log(`Passed: ${passedTests}/${testCases.length} tests`);
    
    if (errors.length > 0) {
      console.log('\nErrors:');
      errors.forEach(error => console.log(`- ${error}`));
      process.exit(1);
    } else {
      console.log('\nAll tests passed!');
    }
  } catch (error) {
    console.error('Failed to run analyzer:', error);
    process.exit(1);
  }
});
