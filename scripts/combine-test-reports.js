/**
 * Test Report Combiner
 *
 * This script combines multiple test reports into a single comprehensive report.
 * It's designed to be run after downloading test artifacts from GitHub Actions.
 */

const fs = require('fs');
const path = require('path');

function extractSummary(reportPath) {
  try {
    const content = fs.readFileSync(reportPath, 'utf8');

    // Extract summary section
    const summaryMatch = content.match(/## Summary\s+\n([\s\S]*?)(?=\n##|$)/);
    if (!summaryMatch) return null;

    const summaryText = summaryMatch[1];

    // Parse metrics
    const totalMatch = summaryText.match(/Total Tests[^\d]*(\d+)/);
    const passedMatch = summaryText.match(/Passed[^\d]*(\d+)[^\d]*\(([^%]+)%\)/);
    const failedMatch = summaryText.match(/Failed[^\d]*(\d+)/);
    const errorsMatch = summaryText.match(/Errors[^\d]*(\d+)/);
    const skippedMatch = summaryText.match(/Skipped[^\d]*(\d+)/);

    return {
      total: totalMatch ? parseInt(totalMatch[1]) : 0,
      passed: passedMatch ? parseInt(passedMatch[1]) : 0,
      passRate: passedMatch ? parseFloat(passedMatch[2]) : 0,
      failed: failedMatch ? parseInt(failedMatch[1]) : 0,
      errors: errorsMatch ? parseInt(errorsMatch[1]) : 0,
      skipped: skippedMatch ? parseInt(skippedMatch[1]) : 0,
    };
  } catch (error) {
    console.error(`Error extracting summary from ${reportPath}:`, error);
    return null;
  }
}

function combineReports() {
  const reportsDir = path.join(process.cwd(), 'docs', 'test-reports');
  const outputPath = path.join(process.cwd(), 'docs', 'latest-test-results.md');

  // Find all markdown reports
  const reportFiles = fs
    .readdirSync(reportsDir)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(reportsDir, file));

  if (reportFiles.length === 0) {
    console.log('No report files found');
    return;
  }

  // Extract summaries
  const summaries = reportFiles
    .map(file => ({
      file,
      summary: extractSummary(file),
      name: path.basename(file, '.md'),
    }))
    .filter(item => item.summary !== null);

  if (summaries.length === 0) {
    console.log('No valid summaries found in reports');
    return;
  }

  // Calculate combined metrics
  const combined = {
    total: summaries.reduce((sum, item) => sum + item.summary.total, 0),
    passed: summaries.reduce((sum, item) => sum + item.summary.passed, 0),
    failed: summaries.reduce((sum, item) => sum + item.summary.failed, 0),
    errors: summaries.reduce((sum, item) => sum + item.summary.errors, 0),
    skipped: summaries.reduce((sum, item) => sum + item.summary.skipped, 0),
  };

  combined.passRate =
    combined.total > 0 ? ((combined.passed / combined.total) * 100).toFixed(2) : '0.00';

  // Generate combined report
  const date = new Date().toISOString().split('T')[0];
  let report = '# Combined Test Results\n\n';
  report += `*Generated on: ${date}*\n\n`;

  report += '## Overall Summary\n\n';
  report += `- **Total Tests**: ${combined.total}\n`;
  report += `- **Passed**: ${combined.passed} (${combined.passRate}%)\n`;
  report += `- **Failed**: ${combined.failed}\n`;
  report += `- **Errors**: ${combined.errors}\n`;
  report += `- **Skipped**: ${combined.skipped}\n\n`;

  report += '## Individual Test Suites\n\n';

  summaries.forEach(item => {
    const s = item.summary;
    report += `### ${item.name}\n\n`;
    report += `- **Total Tests**: ${s.total}\n`;
    report += `- **Pass Rate**: ${s.passRate}%\n`;
    report += `- **Failed**: ${s.failed}\n`;
    report += `- **Errors**: ${s.errors}\n`;
    report += `- **Skipped**: ${s.skipped}\n`;
    report += `- [View Full Report](./test-reports/${path.basename(item.file)})\n\n`;
  });

  // Write combined report
  fs.writeFileSync(outputPath, report);
  console.log(`Combined report written to ${outputPath}`);
}

function main() {
  try {
    combineReports();
  } catch (error) {
    console.error('Error combining test reports:', error);
    process.exit(1);
  }
}

main();
