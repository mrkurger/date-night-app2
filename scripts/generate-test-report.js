/**
 * Test Report Generator
 *
 * This script converts JUnit XML test results to markdown format for documentation.
 * It's designed to be run as part of GitHub Actions workflows to generate
 * human-readable test reports that can be committed to the repository.
 */

import fs from 'fs/promises';
import path from 'path';

// Simple XML parser for JUnit format
function parseJUnitXML(xmlString) {
  // This is a simplified parser for demonstration
  // In production, use a proper XML parser like xml2js

  const results = {
    testsuites: [],
    summary: {
      tests: 0,
      failures: 0,
      errors: 0,
      skipped: 0,
    },
  };

  // Extract testsuite elements
  const testsuiteRegex = /<testsuite[^>]*>/g;
  const testsuiteMatches = xmlString.match(testsuiteRegex) || [];

  testsuiteMatches.forEach(match => {
    const nameMatch = match.match(/name="([^"]*)"/);
    const testsMatch = match.match(/tests="([^"]*)"/);
    const failuresMatch = match.match(/failures="([^"]*)"/);
    const errorsMatch = match.match(/errors="([^"]*)"/);
    const skippedMatch = match.match(/skipped="([^"]*)"/);
    const timeMatch = match.match(/time="([^"]*)"/);

    const suite = {
      name: nameMatch ? nameMatch[1] : 'Unknown',
      tests: testsMatch ? parseInt(testsMatch[1]) : 0,
      failures: failuresMatch ? parseInt(failuresMatch[1]) : 0,
      errors: errorsMatch ? parseInt(errorsMatch[1]) : 0,
      skipped: skippedMatch ? parseInt(skippedMatch[1]) : 0,
      time: timeMatch ? parseFloat(timeMatch[1]) : 0,
      testcases: [],
    };

    results.summary.tests += suite.tests;
    results.summary.failures += suite.failures;
    results.summary.errors += suite.errors;
    results.summary.skipped += suite.skipped;

    // Extract testcase elements for this suite
    const suiteStartIndex = xmlString.indexOf(match);
    const suiteEndIndex = xmlString.indexOf('</testsuite>', suiteStartIndex);
    const suiteContent = xmlString.substring(suiteStartIndex, suiteEndIndex);

    const testcaseRegex = /<testcase[^>]*>/g;
    const testcaseMatches = suiteContent.match(testcaseRegex) || [];

    testcaseMatches.forEach(tcMatch => {
      const tcNameMatch = tcMatch.match(/name="([^"]*)"/);
      const tcClassMatch = tcMatch.match(/classname="([^"]*)"/);
      const tcTimeMatch = tcMatch.match(/time="([^"]*)"/);

      const tcStartIndex = suiteContent.indexOf(tcMatch);
      const tcEndIndex = suiteContent.indexOf('</testcase>', tcStartIndex);
      const tcContent = suiteContent.substring(tcStartIndex, tcEndIndex);

      const testcase = {
        name: tcNameMatch ? tcNameMatch[1] : 'Unknown',
        classname: tcClassMatch ? tcClassMatch[1] : 'Unknown',
        time: tcTimeMatch ? parseFloat(tcTimeMatch[1]) : 0,
        failure: tcContent.includes('<failure'),
        error: tcContent.includes('<error'),
        skipped: tcContent.includes('<skipped'),
      };

      if (testcase.failure || testcase.error) {
        const failureMatch =
          tcContent.match(/<failure[^>]*message="([^"]*)"/) ||
          tcContent.match(/<error[^>]*message="([^"]*)"/);
        testcase.message = failureMatch ? failureMatch[1] : 'No message';
      }

      suite.testcases.push(testcase);
    });

    results.testsuites.push(suite);
  });

  return results;
}

function generateMarkdownReport(results) {
  const date = new Date().toISOString().split('T')[0];
  let report = '# Test Results\n\n';
  report += `*Generated on: ${date}*\n\n`;

  // Summary section
  const totalPassed =
    results.summary.tests -
    results.summary.failures -
    results.summary.errors -
    results.summary.skipped;
  const passRate =
    results.summary.tests > 0 ? ((totalPassed / results.summary.tests) * 100).toFixed(2) : '0.00';

  report += '## Summary\n\n';
  report += `- **Total Tests**: ${results.summary.tests}\n`;
  report += `- **Passed**: ${totalPassed} (${passRate}%)\n`;
  report += `- **Failed**: ${results.summary.failures}\n`;
  report += `- **Errors**: ${results.summary.errors}\n`;
  report += `- **Skipped**: ${results.summary.skipped}\n\n`;

  // Test suites section
  report += '## Test Suites\n\n';

  results.testsuites.forEach(suite => {
    const suitePassed = suite.tests - suite.failures - suite.errors - suite.skipped;
    const suitePassRate = suite.tests > 0 ? ((suitePassed / suite.tests) * 100).toFixed(2) : '0.00';

    report += `### ${suite.name}\n\n`;
    report += `- **Tests**: ${suite.tests}\n`;
    report += `- **Pass Rate**: ${suitePassRate}%\n`;
    report += `- **Duration**: ${suite.time.toFixed(2)}s\n\n`;

    if (suite.failures > 0 || suite.errors > 0) {
      report += '#### Failed Tests\n\n';

      suite.testcases.forEach(testcase => {
        if (testcase.failure || testcase.error) {
          report += `- **${testcase.name}**: `;
          if (testcase.failure) {
            report += `Failed - ${testcase.message || 'No message'}\n`;
          } else if (testcase.error) {
            report += `Error - ${testcase.message || 'No message'}\n`;
          }
        }
      });

      report += '\n';
    }
  });

  return report;
}

function generateSummaryReport(results) {
  const date = new Date().toISOString().split('T')[0];
  const totalPassed =
    results.summary.tests -
    results.summary.failures -
    results.summary.errors -
    results.summary.skipped;
  const passRate =
    results.summary.tests > 0 ? ((totalPassed / results.summary.tests) * 100).toFixed(2) : '0.00';

  let report = '# Latest Test Results\n\n';
  report += `*Generated on: ${date}*\n\n`;
  report += `## Summary\n\n`;
  report += `- **Total Tests**: ${results.summary.tests}\n`;
  report += `- **Pass Rate**: ${passRate}%\n`;
  report += `- **Failed**: ${results.summary.failures}\n`;
  report += `- **Errors**: ${results.summary.errors}\n`;
  report += `- **Skipped**: ${results.summary.skipped}\n\n`;
  report += `[View Full Report](./test-reports/test-results.md)\n`;

  return report;
}

function main() {
  try {
    // Check if test results exist
    const testResultsPath = path.join(process.cwd(), 'test-results', 'junit.xml');

    if (!fs.existsSync(testResultsPath)) {
      console.log('No test results found at', testResultsPath);
      return;
    }

    // Read and parse test results
    const xmlData = fs.readFileSync(testResultsPath, 'utf8');
    const results = parseJUnitXML(xmlData);

    // Generate reports
    const fullReport = generateMarkdownReport(results);
    const summaryReport = generateSummaryReport(results);

    // Create directories if they don't exist
    const testReportsDir = path.join(process.cwd(), 'test-reports');
    const docsDir = path.join(process.cwd(), 'docs');

    if (!fs.existsSync(testReportsDir)) {
      fs.mkdirSync(testReportsDir, { recursive: true });
    }

    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    // Write reports
    fs.writeFileSync(path.join(testReportsDir, 'test-results.md'), fullReport);
    fs.writeFileSync(path.join(docsDir, 'latest-test-results.md'), summaryReport);

    console.log('Test reports generated successfully');
  } catch (error) {
    console.error('Error generating test reports:', error);
    process.exit(1);
  }
}

main();
