/**
 * run-trivy-scan.js
 * 
 * This script runs Trivy for code scanning and outputs a summary report.
 * Requires Trivy installed on the runner.
 * 
 * Usage: node .github/scripts/run-trivy-scan.js
 */
import { exec as execCb } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const exec = promisify(execCb);

/**
 * Runs Trivy and saves results.
 */
export default async function runTrivyScan(targetDir = '.') {
  try {
    await fs.mkdir('security-reports', { recursive: true });
    // Run Trivy file system scan
    const reportPath = `security-reports/trivy-report.json`;
    await exec(`trivy fs --format json --output ${reportPath} ${targetDir}`);
    // Summarize results
    const report = JSON.parse(await fs.readFile(reportPath, 'utf8'));
    let summary = `# Trivy Scan Summary\n\n`;
    if (report.Results) {
      for (const r of report.Results) {
        if (r.Vulnerabilities && r.Vulnerabilities.length) {
          summary += `## ${r.Target}\n`;
          for (const v of r.Vulnerabilities) {
            summary += `- [${v.Severity}] ${v.Title} (${v.VulnerabilityID})\n`;
          }
        }
      }
    }
    await fs.writeFile('security-reports/trivy-summary.md', summary, 'utf8');
    console.log('[runTrivyScan] Trivy scan and summary complete.');
  } catch (err) {
    console.error('[runTrivyScan] Trivy scan failed:', err);
  }
}