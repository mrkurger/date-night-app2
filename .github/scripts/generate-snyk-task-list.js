/**
 * Script to generate a prioritized task list from Snyk scan results
 *
 * This script processes the JSON output from Snyk scans and creates a markdown file
 * with a prioritized list of issues to address, organized by severity and impact.
 * It also provides detailed information about vulnerable dependencies and remediation strategies.
 *
 * Input files:
 * - snyk-root-results.json: Snyk scan results for the root project
 * - snyk-server-results.json: Snyk scan results for the server project
 * - snyk-client-results.json: Snyk scan results for the client project
 * - npm-root-deps-tree.json: npm dependency tree for the root project
 * - npm-server-deps-tree.json: npm dependency tree for the server project
 * - npm-client-deps-tree.json: npm dependency tree for the client project
 * - snyk-root-upgrade-paths.json: Upgrade paths for the root project
 * - snyk-server-upgrade-paths.json: Upgrade paths for the server project
 * - snyk-client-upgrade-paths.json: Upgrade paths for the client project
 *
 * Output files:
 * - docs/snyk-reports/prioritized-issues.md: Detailed list of issues with remediation steps
 * - docs/snyk-reports/issues-summary.md: Summary of issues by severity and type
 * - docs/snyk-reports/vulnerable-dependencies.md: Analysis of vulnerable dependencies
 */

const fs = require('fs');
const path = require('path');

// Define severity levels and their priority order
const SEVERITY_LEVELS = {
  critical: 1,
  high: 2,
  medium: 3,
  low: 4,
};

// Define issue types and their descriptions
const ISSUE_TYPES = {
  vuln: 'Vulnerability',
  license: 'License Issue',
  configuration: 'Configuration Issue',
  code: 'Code Quality Issue',
};

/**
 * Reads and parses Snyk results from a JSON file
 * Handles both regular and gzipped JSON files
 *
 * @param {string} filePath - Path to the Snyk results JSON file
 * @returns {Object|null} - Parsed JSON data or null if file doesn't exist or is invalid
 */
function readSnykResults(filePath) {
  try {
    // Check for regular JSON file
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      try {
        return JSON.parse(data);
      } catch (parseError) {
        console.error(`Error parsing JSON in ${filePath}: ${parseError.message}`);
        return null;
      }
    }
    // Check for gzipped JSON file
    else if (fs.existsSync(`${filePath}.gz`)) {
      try {
        // We can't directly read gzipped files in this script
        // Log a warning and suggest decompressing the file
        console.warn(`Found gzipped file ${filePath}.gz. Please decompress it first.`);
        return null;
      } catch (gzipError) {
        console.error(`Error reading gzipped file ${filePath}.gz: ${gzipError.message}`);
        return null;
      }
    } else {
      console.warn(`File not found: ${filePath} or ${filePath}.gz`);
      return null;
    }
  } catch (error) {
    console.error(`Error reading ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Extracts vulnerability issues from Snyk results
 *
 * @param {Object} results - Parsed Snyk results
 * @param {string} projectName - Name of the project (e.g., "Root", "Server", "Client")
 * @returns {Array} - Array of extracted and normalized vulnerability issues
 */
function extractIssues(results, projectName) {
  if (!results || !results.vulnerabilities) {
    console.warn(`No vulnerabilities found in ${projectName} results`);
    return [];
  }

  return results.vulnerabilities.map(vuln => {
    // Safely access properties with optional chaining and nullish coalescing
    const packageName = vuln?.packageName || 'unknown-package';

    // Determine issue type
    let type = 'vuln';
    if (vuln?.license) type = 'license';
    else if (vuln?.configuration) type = 'configuration';
    else if (vuln?.code) type = 'code';

    // Extract upgrade paths if available
    let upgradePaths = [];
    if (vuln?.upgradePath && Array.isArray(vuln.upgradePath) && vuln.upgradePath.length > 0) {
      upgradePaths = vuln.upgradePath.filter(Boolean);
    }

    // Extract remediation advice
    let remediationAdvice = '';
    if (vuln?.remediation?.advice) {
      remediationAdvice = vuln.remediation.advice;
    }

    // Extract upgrade commands if available
    let upgradeCommands = [];
    if (vuln?.remediation?.pin && typeof vuln.remediation.pin === 'object') {
      try {
        const pins = Object.entries(vuln.remediation.pin);
        pins.forEach(([pkg, version]) => {
          if (pkg && version) {
            upgradeCommands.push(`npm install ${pkg}@${version}`);
          }
        });
      } catch (error) {
        console.warn(`Error extracting upgrade commands for ${packageName}: ${error.message}`);
      }
    }

    // Safely extract CWE identifiers
    let cweIdentifiers = [];
    try {
      cweIdentifiers = vuln?.identifiers?.CWE || [];
      // Ensure it's an array
      if (!Array.isArray(cweIdentifiers)) {
        cweIdentifiers = [String(cweIdentifiers)];
      }
    } catch (error) {
      console.warn(`Error extracting CWE identifiers for ${packageName}: ${error.message}`);
    }

    // Determine if it's a transitive dependency
    const isTransitive = vuln?.from && Array.isArray(vuln.from) && vuln.from.length > 2;

    return {
      id: vuln?.id || `unknown-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: vuln?.title || `Issue in ${packageName}`,
      severity: vuln?.severity || 'medium',
      packageName,
      version: vuln?.version || 'unknown',
      fixedIn: vuln?.fixedIn || [],
      description: vuln?.description || 'No description available',
      type,
      projectName,
      path: vuln?.from && Array.isArray(vuln.from) ? vuln.from.join(' > ') : '',
      cwe: cweIdentifiers,
      cvssScore: vuln?.cvssScore || 0,
      isPatchable: !!vuln?.isPatchable,
      isUpgradable: !!vuln?.isUpgradable,
      upgradePaths,
      upgradeCommands,
      remediation: vuln?.remediation || '',
      remediationAdvice,
      language: vuln?.language || 'javascript',
      packageManager: vuln?.packageManager || 'npm',
      publicationTime: vuln?.publicationTime,
      disclosureTime: vuln?.disclosureTime,
      exploit: vuln?.exploit || 'Not Known',
      isMalicious: !!vuln?.malicious,
      isTransitive,
    };
  });
}

/**
 * Extracts dependency information from npm ls output JSON
 * Handles both regular and gzipped JSON files
 *
 * @param {string} filePath - Path to the npm ls JSON file
 * @returns {Object|null} - Normalized dependency information or null if file doesn't exist or is invalid
 */
function extractDependencyInfo(filePath) {
  try {
    // Check for regular JSON file
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      try {
        const depsData = JSON.parse(data);
        return {
          name: depsData?.name || 'unknown',
          version: depsData?.version || 'unknown',
          dependencies: depsData?.dependencies || {},
        };
      } catch (parseError) {
        console.error(`Error parsing JSON in ${filePath}: ${parseError.message}`);
        return null;
      }
    }
    // Check for gzipped JSON file
    else if (fs.existsSync(`${filePath}.gz`)) {
      console.warn(`Found gzipped file ${filePath}.gz. Using simplified dependency info.`);
      // Return a simplified dependency object since we can't read the gzipped file directly
      return {
        name: 'unknown (gzipped file)',
        version: 'unknown',
        dependencies: {},
      };
    } else {
      console.warn(`Dependency info file not found: ${filePath} or ${filePath}.gz`);
      return null;
    }
  } catch (error) {
    console.error(`Error reading dependency info from ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Extracts upgrade paths from Snyk results
 * Handles both regular and gzipped JSON files
 *
 * @param {string} filePath - Path to the Snyk upgrade paths JSON file
 * @returns {Object} - Map of package names to upgrade path information
 */
function extractUpgradePaths(filePath) {
  try {
    // Check for regular JSON file
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      try {
        const results = JSON.parse(data);

        if (!results?.vulnerabilities) {
          console.warn(`No vulnerabilities found in upgrade paths file: ${filePath}`);
          return {};
        }

        const upgradePaths = {};
        results.vulnerabilities.forEach(vuln => {
          if (vuln?.packageName && vuln?.upgradePath) {
            // Ensure upgradePath is an array before filtering
            const upgradePath = Array.isArray(vuln.upgradePath)
              ? vuln.upgradePath.filter(Boolean)
              : [];

            // Ensure fixedIn is an array
            const fixedIn = Array.isArray(vuln.fixedIn)
              ? vuln.fixedIn
              : vuln.fixedIn
                ? [vuln.fixedIn]
                : [];

            upgradePaths[vuln.packageName] = {
              currentVersion: vuln.version || 'unknown',
              upgradePath,
              fixedIn,
            };
          }
        });

        return upgradePaths;
      } catch (parseError) {
        console.error(`Error parsing JSON in ${filePath}: ${parseError.message}`);
        return {};
      }
    }
    // Check for gzipped JSON file
    else if (fs.existsSync(`${filePath}.gz`)) {
      console.warn(`Found gzipped file ${filePath}.gz. Unable to extract upgrade paths.`);
      return {};
    } else {
      console.warn(`Upgrade paths file not found: ${filePath} or ${filePath}.gz`);
      return {};
    }
  } catch (error) {
    console.error(`Error reading upgrade paths from ${filePath}: ${error.message}`);
    return {};
  }
}

// Function to prioritize issues
function prioritizeIssues(issues) {
  // Sort by severity (critical -> high -> medium -> low)
  return issues.sort((a, b) => {
    // First sort by severity
    const severityDiff = SEVERITY_LEVELS[a.severity] - SEVERITY_LEVELS[b.severity];
    if (severityDiff !== 0) return severityDiff;

    // Then by CVSS score (higher score first)
    const cvssScoreDiff = b.cvssScore - a.cvssScore;
    if (cvssScoreDiff !== 0) return cvssScoreDiff;

    // Then by whether it's fixable (fixable issues first)
    const fixabilityDiff = (b.isUpgradable || b.isPatchable) - (a.isUpgradable || a.isPatchable);
    if (fixabilityDiff !== 0) return fixabilityDiff;

    // Then by whether it's a direct or transitive dependency (direct first)
    const transitivityDiff = a.isTransitive - b.isTransitive;
    if (transitivityDiff !== 0) return transitivityDiff;

    // Finally by package name
    return a.packageName.localeCompare(b.packageName);
  });
}

// Function to generate markdown for the task list
function generateMarkdown(issues, dependencyInfo, upgradePaths) {
  const date = new Date().toISOString().split('T')[0];
  let markdown = `# Snyk Issues Task List\n\n`;
  markdown += `*Generated on: ${date}*\n\n`;

  if (issues.length === 0) {
    markdown += `## No Issues Found\n\n`;
    markdown += `Congratulations! No security or code quality issues were found in the latest scan.\n\n`;
    return markdown;
  }

  markdown += `## Summary\n\n`;

  // Count issues by severity
  const severityCounts = {};
  issues.forEach(issue => {
    severityCounts[issue.severity] = (severityCounts[issue.severity] || 0) + 1;
  });

  // Count issues by project
  const projectCounts = {};
  issues.forEach(issue => {
    projectCounts[issue.projectName] = (projectCounts[issue.projectName] || 0) + 1;
  });

  // Count issues by type
  const typeCounts = {};
  issues.forEach(issue => {
    typeCounts[issue.type] = (typeCounts[issue.type] || 0) + 1;
  });

  // Count direct vs transitive dependencies
  const directIssues = issues.filter(issue => !issue.isTransitive).length;
  const transitiveIssues = issues.filter(issue => issue.isTransitive).length;

  // Generate summary tables
  markdown += `### Issues by Severity\n\n`;
  markdown += `| Severity | Count |\n`;
  markdown += `|----------|-------|\n`;
  Object.keys(SEVERITY_LEVELS).forEach(severity => {
    if (severityCounts[severity]) {
      markdown += `| ${severity.charAt(0).toUpperCase() + severity.slice(1)} | ${severityCounts[severity]} |\n`;
    }
  });

  markdown += `\n### Issues by Project\n\n`;
  markdown += `| Project | Count |\n`;
  markdown += `|---------|-------|\n`;
  Object.keys(projectCounts)
    .sort()
    .forEach(project => {
      markdown += `| ${project} | ${projectCounts[project]} |\n`;
    });

  markdown += `\n### Issues by Type\n\n`;
  markdown += `| Type | Count |\n`;
  markdown += `|------|-------|\n`;
  Object.keys(ISSUE_TYPES).forEach(type => {
    if (typeCounts[type]) {
      markdown += `| ${ISSUE_TYPES[type]} | ${typeCounts[type]} |\n`;
    }
  });

  markdown += `\n### Dependency Analysis\n\n`;
  markdown += `| Dependency Type | Count |\n`;
  markdown += `|----------------|-------|\n`;
  markdown += `| Direct Dependencies | ${directIssues} |\n`;
  markdown += `| Transitive Dependencies | ${transitiveIssues} |\n`;

  // Generate detailed issue list by severity
  Object.keys(SEVERITY_LEVELS).forEach(severity => {
    const severityIssues = issues.filter(issue => issue.severity === severity);
    if (severityIssues.length > 0) {
      markdown += `\n## ${severity.charAt(0).toUpperCase() + severity.slice(1)} Severity Issues (${severityIssues.length})\n\n`;

      severityIssues.forEach((issue, index) => {
        markdown += `### ${index + 1}. ${issue.title}\n\n`;
        markdown += `- **Package**: \`${issue.packageName}@${issue.version}\`\n`;
        markdown += `- **Type**: ${ISSUE_TYPES[issue.type]}\n`;
        markdown += `- **Project**: ${issue.projectName}\n`;
        markdown += `- **Dependency Type**: ${issue.isTransitive ? 'Transitive (Indirect)' : 'Direct'}\n`;

        if (issue.cvssScore) {
          markdown += `- **CVSS Score**: ${issue.cvssScore}\n`;
        }

        if (issue.cwe && issue.cwe.length > 0) {
          markdown += `- **CWE**: ${issue.cwe.join(', ')}\n`;
        }

        markdown += `- **Dependency Path**: ${issue.path || 'Direct dependency'}\n`;

        if (issue.publicationTime) {
          markdown += `- **Published**: ${new Date(issue.publicationTime).toISOString().split('T')[0]}\n`;
        }

        if (issue.exploit && issue.exploit !== 'Not Known') {
          markdown += `- **Exploit Status**: ${issue.exploit}\n`;
        }

        if (issue.isMalicious) {
          markdown += `- **⚠️ MALICIOUS PACKAGE DETECTED ⚠️**\n`;
        }

        markdown += `\n**Description**:\n${issue.description}\n\n`;

        markdown += `**Remediation**:\n`;
        if (issue.isUpgradable) {
          markdown += `- ✅ Upgradable to: ${issue.fixedIn.join(', ')}\n`;

          if (issue.upgradeCommands && issue.upgradeCommands.length > 0) {
            markdown += `\n**Upgrade Commands**:\n\`\`\`bash\n${issue.upgradeCommands.join('\n')}\n\`\`\`\n`;
          } else if (issue.upgradePaths && issue.upgradePaths.length > 0) {
            markdown += `\n**Upgrade Path**:\n\`${issue.upgradePaths.join(' > ')}\`\n`;
          }
        } else if (issue.isPatchable) {
          markdown += `- ✅ Patchable with \`snyk wizard\`\n`;
        } else if (issue.fixedIn && issue.fixedIn.length > 0) {
          markdown += `- ⚠️ Fixed in version(s): ${issue.fixedIn.join(', ')} (requires major upgrade)\n`;
        } else {
          markdown += `- ❌ No direct fix available. Consider replacing this dependency.\n`;
        }

        if (issue.remediationAdvice) {
          markdown += `\n**Remediation Advice**:\n${issue.remediationAdvice}\n`;
        }

        // Add specific advice for transitive dependencies
        if (issue.isTransitive) {
          markdown += `\n**Handling Transitive Dependencies**:\n`;
          markdown += `1. Update the direct dependency that requires this package\n`;
          markdown += `2. If that's not possible, consider using npm overrides or resolutions:\n`;
          markdown += `\`\`\`json\n"overrides": {\n  "${issue.packageName}": "${issue.fixedIn[0] || 'latest'}"\n}\n\`\`\`\n`;
        }

        markdown += `\n---\n\n`;
      });
    }
  });

  // Generate dependency upgrade plan
  markdown += `## Dependency Upgrade Plan\n\n`;

  // Group issues by package
  const packageIssues = {};
  issues.forEach(issue => {
    if (!packageIssues[issue.packageName]) {
      packageIssues[issue.packageName] = [];
    }
    packageIssues[issue.packageName].push(issue);
  });

  // Sort packages by highest severity issue
  const sortedPackages = Object.keys(packageIssues).sort((a, b) => {
    const aHighestSeverity = Math.min(
      ...packageIssues[a].map(issue => SEVERITY_LEVELS[issue.severity])
    );
    const bHighestSeverity = Math.min(
      ...packageIssues[b].map(issue => SEVERITY_LEVELS[issue.severity])
    );
    return aHighestSeverity - bHighestSeverity;
  });

  markdown += `### Recommended Upgrade Order\n\n`;
  markdown += `| Package | Current Version | Recommended Version | Severity | Direct/Transitive |\n`;
  markdown += `|---------|-----------------|---------------------|----------|-------------------|\n`;

  sortedPackages.forEach(packageName => {
    const issues = packageIssues[packageName];
    const highestSeverityIssue = issues.reduce((prev, current) => {
      return SEVERITY_LEVELS[prev.severity] < SEVERITY_LEVELS[current.severity] ? prev : current;
    });

    const recommendedVersion =
      highestSeverityIssue.fixedIn && highestSeverityIssue.fixedIn.length > 0
        ? highestSeverityIssue.fixedIn[0]
        : 'No fixed version';

    markdown += `| \`${packageName}\` | ${highestSeverityIssue.version} | ${recommendedVersion} | ${highestSeverityIssue.severity.charAt(0).toUpperCase() + highestSeverityIssue.severity.slice(1)} | ${highestSeverityIssue.isTransitive ? 'Transitive' : 'Direct'} |\n`;
  });

  // Add batch upgrade commands
  markdown += `\n### Batch Upgrade Commands\n\n`;

  // Direct dependencies that can be upgraded
  const directUpgradable = issues.filter(issue => !issue.isTransitive && issue.isUpgradable);
  const directUpgradeCommands = new Set();

  directUpgradable.forEach(issue => {
    if (issue.upgradeCommands && issue.upgradeCommands.length > 0) {
      issue.upgradeCommands.forEach(cmd => directUpgradeCommands.add(cmd));
    } else if (issue.fixedIn && issue.fixedIn.length > 0) {
      directUpgradeCommands.add(`npm install ${issue.packageName}@${issue.fixedIn[0]}`);
    }
  });

  if (directUpgradeCommands.size > 0) {
    markdown += `**Direct Dependencies**:\n\`\`\`bash\n${Array.from(directUpgradeCommands).join('\n')}\n\`\`\`\n\n`;
  } else {
    markdown += `**Direct Dependencies**: No direct upgrades available.\n\n`;
  }

  // Transitive dependencies that need resolution overrides
  const transitiveIssuesFiltered = issues.filter(issue => issue.isTransitive);
  if (transitiveIssuesFiltered.length > 0) {
    markdown += `**Transitive Dependencies**:\n\n`;
    markdown += `Add the following to your package.json:\n\`\`\`json\n"overrides": {\n`;

    const overrides = transitiveIssuesFiltered
      .filter(issue => issue.fixedIn && issue.fixedIn.length > 0)
      .map(issue => `  "${issue.packageName}": "${issue.fixedIn[0]}"`);

    markdown += overrides.join(',\n');
    markdown += `\n}\n\`\`\`\n\n`;
  }

  markdown += `## Next Steps\n\n`;
  markdown += `1. **Critical and High Issues**: Address these immediately as they pose significant security risks\n`;
  markdown += `2. **Upgradable Dependencies**: Run \`npm audit fix\` or use the specific upgrade commands provided above\n`;
  markdown += `3. **Patchable Issues**: Run \`snyk wizard\` to apply patches where direct upgrades aren't possible\n`;
  markdown += `4. **Transitive Dependencies**: Use the overrides approach for indirect dependencies\n`;
  markdown += `5. **Complex Issues**: For issues requiring major version upgrades, plan and test thoroughly before implementing\n`;
  markdown += `6. **Unresolvable Issues**: Consider alternative dependencies or implementing additional security controls\n\n`;

  markdown += `## Resources\n\n`;
  markdown += `- [Snyk Documentation](https://docs.snyk.io/)\n`;
  markdown += `- [npm Overrides Documentation](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#overrides)\n`;
  markdown += `- [OWASP Top 10](https://owasp.org/www-project-top-ten/)\n`;
  markdown += `- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices/security-best-practices)\n`;

  return markdown;
}

// Function to generate a dependency report
function generateDependencyReport(issues, dependencyInfo) {
  const date = new Date().toISOString().split('T')[0];
  let report = `# Vulnerable Dependencies Report\n\n`;
  report += `*Generated on: ${date}*\n\n`;

  if (issues.length === 0) {
    report += `## No Vulnerable Dependencies Found\n\n`;
    report += `Congratulations! No vulnerable dependencies were found in the latest scan.\n\n`;
    return report;
  }

  // Group issues by package
  const packageIssues = {};
  issues.forEach(issue => {
    if (!packageIssues[issue.packageName]) {
      packageIssues[issue.packageName] = [];
    }
    packageIssues[issue.packageName].push(issue);
  });

  // Count direct vs transitive dependencies
  const directVulnerablePackages = new Set();
  const transitiveVulnerablePackages = new Set();

  issues.forEach(issue => {
    if (issue.isTransitive) {
      transitiveVulnerablePackages.add(issue.packageName);
    } else {
      directVulnerablePackages.add(issue.packageName);
    }
  });

  report += `## Dependency Overview\n\n`;
  report += `- **Total Vulnerable Packages**: ${Object.keys(packageIssues).length}\n`;
  report += `- **Direct Vulnerable Dependencies**: ${directVulnerablePackages.size}\n`;
  report += `- **Transitive Vulnerable Dependencies**: ${transitiveVulnerablePackages.size}\n\n`;

  // Generate vulnerability table by package
  report += `## Vulnerable Packages\n\n`;
  report += `| Package | Version | Vulnerabilities | Highest Severity | Fixable |\n`;
  report += `|---------|---------|-----------------|------------------|--------|\n`;

  Object.keys(packageIssues)
    .sort()
    .forEach(packageName => {
      const issues = packageIssues[packageName];
      const version = issues[0].version;
      const vulnerabilityCount = issues.length;

      // Find highest severity
      const highestSeverity = issues.reduce((highest, issue) => {
        return SEVERITY_LEVELS[issue.severity] < SEVERITY_LEVELS[highest]
          ? issue.severity
          : highest;
      }, 'low');

      // Check if fixable
      const isFixable = issues.some(issue => issue.isUpgradable || issue.isPatchable);
      const fixableStatus = isFixable ? '✅' : '❌';

      report += `| \`${packageName}\` | ${version} | ${vulnerabilityCount} | ${highestSeverity.charAt(0).toUpperCase() + highestSeverity.slice(1)} | ${fixableStatus} |\n`;
    });

  // Generate detailed package information
  report += `\n## Package Details\n\n`;

  Object.keys(packageIssues)
    .sort()
    .forEach(packageName => {
      const issues = packageIssues[packageName];
      const version = issues[0].version;
      const isTransitive = issues[0].isTransitive;

      report += `### ${packageName}@${version}\n\n`;
      report += `- **Type**: ${isTransitive ? 'Transitive Dependency' : 'Direct Dependency'}\n`;

      if (isTransitive) {
        report += `- **Dependency Path**: ${issues[0].path || 'Unknown'}\n`;
      }

      // List vulnerabilities
      report += `\n**Vulnerabilities**:\n\n`;
      issues.forEach(issue => {
        report += `- **${issue.title}** (${issue.severity.toUpperCase()})\n`;
        report += `  - CVSS: ${issue.cvssScore}\n`;
        if (issue.fixedIn && issue.fixedIn.length > 0) {
          report += `  - Fixed in: ${issue.fixedIn.join(', ')}\n`;
        }
      });

      // Remediation advice
      report += `\n**Remediation**:\n\n`;

      if (issues.some(issue => issue.isUpgradable)) {
        const fixedVersions = issues
          .filter(issue => issue.fixedIn && issue.fixedIn.length > 0)
          .map(issue => issue.fixedIn[0]);

        const recommendedVersion = fixedVersions.length > 0 ? fixedVersions[0] : 'latest';

        if (!isTransitive) {
          report += `Run the following command to upgrade:\n\`\`\`bash\nnpm install ${packageName}@${recommendedVersion}\n\`\`\`\n\n`;
        } else {
          report += `This is a transitive dependency. You can:\n`;
          report += `1. Upgrade the direct dependency that requires it\n`;
          report += `2. Use npm overrides in package.json:\n`;
          report += `\`\`\`json\n"overrides": {\n  "${packageName}": "${recommendedVersion}"\n}\n\`\`\`\n\n`;
        }
      } else if (issues.some(issue => issue.isPatchable)) {
        report += `This dependency can be patched with Snyk:\n\`\`\`bash\nsnyk wizard\n\`\`\`\n\n`;
      } else {
        report += `No direct fix available. Consider:\n`;
        report += `1. Finding an alternative package\n`;
        report += `2. Implementing additional security controls\n`;
        report += `3. Accepting the risk after assessment\n\n`;
      }

      report += `---\n\n`;
    });

  // Add remediation strategy
  report += `## Remediation Strategy\n\n`;
  report += `### 1. Direct Dependencies\n\n`;
  report += `For direct dependencies, you can update them directly using npm:\n\n`;
  report += `\`\`\`bash\n# Update a specific package\nnpm install package-name@version\n\n# Update all packages according to package.json\nnpm update\n\n# Update all packages including major versions (use with caution)\nnpm update --force\n\`\`\`\n\n`;

  report += `### 2. Transitive Dependencies\n\n`;
  report += `For transitive (indirect) dependencies, you have several options:\n\n`;
  report += `1. **Update the parent dependency** that requires the vulnerable package\n\n`;
  report += `2. **Use npm overrides** (npm 8+):\n`;
  report += `   Add to package.json:\n`;
  report += `   \`\`\`json\n   "overrides": {\n     "vulnerable-package": "safe-version"\n   }\n   \`\`\`\n\n`;
  report += `3. **Use npm resolution** (with npm-force-resolutions package):\n`;
  report += `   \`\`\`json\n   "resolutions": {\n     "vulnerable-package": "safe-version"\n   }\n   \`\`\`\n\n`;
  report += `4. **Use Snyk patches** where available:\n`;
  report += `   \`\`\`bash\n   snyk wizard\n   \`\`\`\n\n`;

  report += `### 3. Testing After Updates\n\n`;
  report += `Always test thoroughly after updating dependencies:\n\n`;
  report += `1. Run your test suite\n`;
  report += `2. Check for breaking changes in updated packages\n`;
  report += `3. Verify application functionality manually\n`;
  report += `4. Run Snyk again to confirm vulnerabilities are resolved\n\n`;

  return report;
}

/**
 * Main function that orchestrates the Snyk report generation process
 *
 * @returns {boolean} - True if the reports were successfully generated, false otherwise
 */
function main() {
  try {
    console.log('Starting Snyk report generation process...');

    // Read Snyk results (handles both regular and gzipped files)
    const rootResults = readSnykResults('snyk-root-results.json');
    const serverResults = readSnykResults('snyk-server-results.json');
    const clientResults = readSnykResults('snyk-client-results.json');

    // Check if we have at least one valid result
    if (!rootResults && !serverResults && !clientResults) {
      console.error('No valid Snyk results found. Please run Snyk scans first.');
      return false;
    }

    // Read dependency information (handles both regular and gzipped files)
    const rootDepsInfo = extractDependencyInfo('npm-root-deps-tree.json');
    const serverDepsInfo = extractDependencyInfo('npm-server-deps-tree.json');
    const clientDepsInfo = extractDependencyInfo('npm-client-deps-tree.json');

    // Read upgrade paths (handles both regular and gzipped files)
    const rootUpgradePaths = extractUpgradePaths('snyk-root-upgrade-paths.json');
    const serverUpgradePaths = extractUpgradePaths('snyk-server-upgrade-paths.json');
    const clientUpgradePaths = extractUpgradePaths('snyk-client-upgrade-paths.json');

    // Combine dependency info and upgrade paths
    const dependencyInfo = {
      root: rootDepsInfo,
      server: serverDepsInfo,
      client: clientDepsInfo,
    };

    const upgradePaths = {
      ...rootUpgradePaths,
      ...serverUpgradePaths,
      ...clientUpgradePaths,
    };

    // Extract issues
    const rootIssues = rootResults ? extractIssues(rootResults, 'Root Project') : [];
    const serverIssues = serverResults ? extractIssues(serverResults, 'Server') : [];
    const clientIssues = clientResults ? extractIssues(clientResults, 'Client Angular') : [];

    // Combine all issues
    const allIssues = [...rootIssues, ...serverIssues, ...clientIssues];

    console.log(`Found ${allIssues.length} total issues across all projects`);

    // Prioritize issues
    const prioritizedIssues = prioritizeIssues(allIssues);

    // Create output directory
    const outputDir = path.join('docs', 'snyk-reports');
    try {
      if (!fs.existsSync(outputDir)) {
        console.log(`Creating output directory: ${outputDir}`);
        fs.mkdirSync(outputDir, { recursive: true });
      }
    } catch (dirError) {
      console.error(`Failed to create output directory ${outputDir}:`, dirError);
      return false;
    }

    // Generate and write reports
    let success = true;

    try {
      const markdown = generateMarkdown(prioritizedIssues, dependencyInfo, upgradePaths);
      fs.writeFileSync(path.join(outputDir, 'prioritized-issues.md'), markdown);
      console.log(`Generated prioritized issues report`);
    } catch (error) {
      console.error('Failed to generate prioritized issues report:', error);
      success = false;
    }

    try {
      const summary = generateSummary(prioritizedIssues);
      fs.writeFileSync(path.join(outputDir, 'issues-summary.md'), summary);
      console.log(`Generated issues summary report`);
    } catch (error) {
      console.error('Failed to generate issues summary report:', error);
      success = false;
    }

    try {
      const dependencyReport = generateDependencyReport(prioritizedIssues, dependencyInfo);
      fs.writeFileSync(path.join(outputDir, 'vulnerable-dependencies.md'), dependencyReport);
      console.log(`Generated vulnerable dependencies report`);
    } catch (error) {
      console.error('Failed to generate vulnerable dependencies report:', error);
      success = false;
    }

    if (success) {
      console.log(`Successfully generated all Snyk reports in docs/snyk-reports/`);
      return true;
    } else {
      console.error(`Some reports failed to generate. Check the logs for details.`);
      return false;
    }
  } catch (error) {
    console.error('Fatal error during Snyk report generation:', error);
    return false;
  }
}

// Function to generate a summary file
function generateSummary(issues) {
  const date = new Date().toISOString().split('T')[0];
  let summary = `# Snyk Issues Summary\n\n`;
  summary += `*Generated on: ${date}*\n\n`;

  if (issues.length === 0) {
    summary += `## No Issues Found\n\n`;
    summary += `Congratulations! No security or code quality issues were found in the latest scan.\n\n`;
    return summary;
  }

  // Count issues by severity
  const severityCounts = {};
  issues.forEach(issue => {
    severityCounts[issue.severity] = (severityCounts[issue.severity] || 0) + 1;
  });

  // Count direct vs transitive dependencies
  const directIssues = issues.filter(issue => !issue.isTransitive).length;
  const transitiveIssues = issues.filter(issue => issue.isTransitive).length;

  // Generate summary table
  summary += `## Issues Overview\n\n`;
  summary += `| Severity | Count | Status |\n`;
  summary += `|----------|-------|--------|\n`;

  Object.keys(SEVERITY_LEVELS).forEach(severity => {
    if (severityCounts[severity]) {
      let status = '🔄 Needs Action';
      if (severity === 'critical' || severity === 'high') {
        status = '🚨 Urgent';
      }
      summary += `| ${severity.charAt(0).toUpperCase() + severity.slice(1)} | ${severityCounts[severity]} | ${status} |\n`;
    }
  });

  summary += `\n## Dependency Analysis\n\n`;
  summary += `- **Direct Dependency Issues**: ${directIssues}\n`;
  summary += `- **Transitive Dependency Issues**: ${transitiveIssues}\n`;

  // Top 5 most critical issues
  const top5 = issues.slice(0, 5);
  if (top5.length > 0) {
    summary += `\n## Top Priority Issues\n\n`;
    summary += `| Issue | Package | Severity | Fixable |\n`;
    summary += `|-------|---------|----------|--------|\n`;

    top5.forEach(issue => {
      const fixable = issue.isUpgradable
        ? '✅ Upgradable'
        : issue.isPatchable
          ? '✅ Patchable'
          : '❌ Manual Fix';
      summary += `| ${issue.title} | \`${issue.packageName}\` | ${issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)} | ${fixable} |\n`;
    });
  }

  // Quick remediation actions
  summary += `\n## Quick Actions\n\n`;

  // Count fixable issues
  const upgradableIssues = issues.filter(issue => issue.isUpgradable).length;
  const patchableIssues = issues.filter(issue => issue.isPatchable).length;
  const manualFixIssues = issues.filter(issue => !issue.isUpgradable && !issue.isPatchable).length;

  summary += `- **Upgradable Issues**: ${upgradableIssues} (can be fixed with \`npm update\` or specific version upgrades)\n`;
  summary += `- **Patchable Issues**: ${patchableIssues} (can be fixed with \`snyk wizard\`)\n`;
  summary += `- **Manual Fix Required**: ${manualFixIssues} (requires alternative approaches)\n\n`;

  summary += `## Available Reports\n\n`;
  summary += `- [Detailed Issues Report](./prioritized-issues.md) - Comprehensive list of all issues with remediation steps\n`;
  summary += `- [Vulnerable Dependencies Report](./vulnerable-dependencies.md) - Focused analysis of vulnerable dependencies with upgrade paths\n\n`;

  return summary;
}

// Execute the main function and handle the result
try {
  const success = main();
  if (!success) {
    console.error('Snyk report generation failed');
    process.exit(1);
  }
} catch (error) {
  console.error('Fatal error executing Snyk report generation:', error);
  process.exit(1);
}
