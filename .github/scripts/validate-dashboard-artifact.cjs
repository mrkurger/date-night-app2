/**
 * Security Dashboard Artifact Validator
 * 
 * Validates generated security dashboard artifacts to ensure they are:
 * - Complete and not corrupted
 * - Have expected content structure
 * - Meet quality standards
 * - Are ready for artifact upload
 * 
 * @author Security Workflow Enhancement
 * @created 2025-01-21
 */

const fs = require('fs');
const path = require('path');
const {
  WorkflowLogger,
  PerformanceTracker,
  ValidationHelper
} = require('./security-workflow-utils.cjs');

class DashboardArtifactValidator {
  constructor() {
    this.logger = new WorkflowLogger('ArtifactValidator');
    this.performance = new PerformanceTracker();
  }

  /**
   * Main validation method
   */
  async validateArtifacts(artifactPath = 'security-dashboard') {
    this.performance.start('total_validation');
    this.logger.info('Starting artifact validation', { artifactPath });

    const validationResults = {
      success: false,
      errors: [],
      warnings: [],
      metrics: {},
      files: {}
    };

    try {
      // Step 1: Validate directory structure
      await this.validateDirectoryStructure(artifactPath, validationResults);

      // Step 2: Validate main dashboard file
      await this.validateDashboardFile(artifactPath, validationResults);

      // Step 3: Validate checksum file
      await this.validateChecksum(artifactPath, validationResults);

      // Step 4: Validate content quality
      await this.validateContentQuality(artifactPath, validationResults);

      // Step 5: Validate file integrity
      await this.validateFileIntegrity(artifactPath, validationResults);

      // Determine overall success
      validationResults.success = validationResults.errors.length === 0;
      
      const totalTime = this.performance.stop('total_validation');
      validationResults.metrics.totalValidationTime = totalTime;

      this.logger.info('Artifact validation completed', {
        success: validationResults.success,
        errors: validationResults.errors.length,
        warnings: validationResults.warnings.length,
        totalTime
      });

      return validationResults;

    } catch (error) {
      const totalTime = this.performance.stop('total_validation');
      this.logger.error('Artifact validation failed', error);
      
      validationResults.success = false;
      validationResults.errors.push(`Validation process failed: ${error.message}`);
      validationResults.metrics.totalValidationTime = totalTime;
      
      return validationResults;
    }
  }

  /**
   * Validate directory structure
   */
  async validateDirectoryStructure(artifactPath, results) {
    this.performance.start('directory_validation');
    this.logger.debug('Validating directory structure');

    try {
      const fullPath = path.resolve(artifactPath);
      
      // Check if directory exists
      if (!fs.existsSync(fullPath)) {
        results.errors.push(`Artifact directory does not exist: ${fullPath}`);
        return;
      }

      // Check if it's actually a directory
      const stats = await fs.promises.stat(fullPath);
      if (!stats.isDirectory()) {
        results.errors.push(`Artifact path is not a directory: ${fullPath}`);
        return;
      }

      // List directory contents
      const contents = await fs.promises.readdir(fullPath);
      results.files.directoryContents = contents;

      this.logger.debug('Directory structure validated', {
        path: fullPath,
        contents: contents.length
      });

    } catch (error) {
      results.errors.push(`Directory validation failed: ${error.message}`);
    } finally {
      const duration = this.performance.stop('directory_validation');
      this.logger.logPerformance('Directory validation', duration);
    }
  }

  /**
   * Validate main dashboard HTML file
   */
  async validateDashboardFile(artifactPath, results) {
    this.performance.start('dashboard_validation');
    this.logger.debug('Validating dashboard HTML file');

    try {
      const dashboardPath = path.join(artifactPath, 'index.html');
      
      // Check if file exists
      if (!fs.existsSync(dashboardPath)) {
        results.errors.push('Main dashboard file (index.html) not found');
        return;
      }

      // Validate file size
      const validation = await ValidationHelper.validateFile(dashboardPath, 1000);
      results.files.dashboard = {
        path: dashboardPath,
        size: validation.size,
        exists: true
      };

      // Read and validate content
      const content = await fs.promises.readFile(dashboardPath, 'utf8');
      
      // Validate HTML structure
      ValidationHelper.validateHtmlContent(content);

      // Additional dashboard-specific validations
      await this.validateDashboardContent(content, results);

      this.logger.debug('Dashboard file validated successfully', {
        size: validation.size,
        contentLength: content.length
      });

    } catch (error) {
      results.errors.push(`Dashboard file validation failed: ${error.message}`);
    } finally {
      const duration = this.performance.stop('dashboard_validation');
      this.logger.logPerformance('Dashboard validation', duration);
    }
  }

  /**
   * Validate dashboard-specific content
   */
  async validateDashboardContent(content, results) {
    const requiredElements = [
      { name: 'Security Dashboard title', pattern: /Security Dashboard/i },
      { name: 'Repository information', pattern: /Repository:/i },
      { name: 'Generated timestamp', pattern: /Generated:/i },
      { name: 'Security Overview section', pattern: /Security Overview/i },
      { name: 'Metrics section', pattern: /metrics/i },
      { name: 'Trivy section', pattern: /Trivy/i },
      { name: 'CodeQL section', pattern: /CodeQL/i },
      { name: 'Recommendations section', pattern: /Recommendations/i }
    ];

    for (const element of requiredElements) {
      if (!element.pattern.test(content)) {
        results.warnings.push(`Missing or malformed element: ${element.name}`);
      }
    }

    // Check for minimum content length
    if (content.length < 5000) {
      results.warnings.push(`Dashboard content seems unusually short (${content.length} characters)`);
    }

    // Check for proper CSS styling
    if (!content.includes('<style>') || !content.includes('</style>')) {
      results.warnings.push('Dashboard appears to be missing CSS styling');
    }

    // Check for responsive design elements
    if (!content.includes('viewport')) {
      results.warnings.push('Dashboard may not be mobile-responsive (missing viewport meta tag)');
    }

    // Validate accessibility basics
    if (!content.includes('lang=')) {
      results.warnings.push('Dashboard missing language attribute for accessibility');
    }

    // Check for potential XSS vulnerabilities
    const dangerousPatterns = [
      /<script[^>]*>(?!.*dashboard.*generated)/i,
      /javascript:/i,
      /on\w+\s*=/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(content)) {
        results.warnings.push('Potential security issue detected in HTML content');
        break;
      }
    }
  }

  /**
   * Validate checksum file
   */
  async validateChecksum(artifactPath, results) {
    this.performance.start('checksum_validation');
    this.logger.debug('Validating checksum file');

    try {
      const checksumPath = path.join(artifactPath, 'checksum.txt');
      const dashboardPath = path.join(artifactPath, 'index.html');

      // Check if checksum file exists
      if (!fs.existsSync(checksumPath)) {
        results.warnings.push('Checksum file not found - artifact integrity cannot be verified');
        return;
      }

      // Read checksum
      const storedChecksum = (await fs.promises.readFile(checksumPath, 'utf8')).trim();
      
      if (!storedChecksum || storedChecksum.length !== 64) {
        results.errors.push('Invalid checksum format (expected 64-character SHA-256 hash)');
        return;
      }

      // Calculate actual checksum of dashboard file
      if (fs.existsSync(dashboardPath)) {
        const dashboardContent = await fs.promises.readFile(dashboardPath, 'utf8');
        const actualChecksum = ValidationHelper.generateChecksum(dashboardContent);

        if (storedChecksum !== actualChecksum) {
          results.errors.push('Checksum mismatch - dashboard file may be corrupted');
        } else {
          results.files.checksum = {
            path: checksumPath,
            valid: true,
            checksum: storedChecksum
          };
          this.logger.debug('Checksum validation passed');
        }
      }

    } catch (error) {
      results.errors.push(`Checksum validation failed: ${error.message}`);
    } finally {
      const duration = this.performance.stop('checksum_validation');
      this.logger.logPerformance('Checksum validation', duration);
    }
  }

  /**
   * Validate content quality
   */
  async validateContentQuality(artifactPath, results) {
    this.performance.start('quality_validation');
    this.logger.debug('Validating content quality');

    try {
      const dashboardPath = path.join(artifactPath, 'index.html');
      
      if (!fs.existsSync(dashboardPath)) {
        return; // Already reported in dashboard validation
      }

      const content = await fs.promises.readFile(dashboardPath, 'utf8');

      // Check for placeholder content that indicates incomplete generation
      const placeholders = [
        'undefined',
        'null',
        'NaN',
        '[object Object]',
        '${',
        'TODO',
        'FIXME'
      ];

      for (const placeholder of placeholders) {
        if (content.includes(placeholder)) {
          results.warnings.push(`Potential placeholder content detected: ${placeholder}`);
        }
      }

      // Check for empty sections
      const emptySectionPatterns = [
        /<tbody>\s*<\/tbody>/gi,
        /<ul>\s*<\/ul>/gi,
        /<div[^>]*>\s*<\/div>/gi
      ];

      let emptyCount = 0;
      for (const pattern of emptySectionPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          emptyCount += matches.length;
        }
      }

      if (emptyCount > 3) {
        results.warnings.push(`High number of empty sections detected (${emptyCount})`);
      }

      // Check for data freshness indicators
      const now = new Date();
      const timestampMatch = content.match(/Generated:\s*([^<]+)/);
      if (timestampMatch) {
        const generatedTime = new Date(timestampMatch[1]);
        const ageHours = (now - generatedTime) / (1000 * 60 * 60);
        
        if (ageHours > 25) { // Allow for some schedule variance
          results.warnings.push(`Dashboard data appears stale (${Math.round(ageHours)} hours old)`);
        }
      }

      this.logger.debug('Content quality validation completed');

    } catch (error) {
      results.warnings.push(`Content quality validation failed: ${error.message}`);
    } finally {
      const duration = this.performance.stop('quality_validation');
      this.logger.logPerformance('Quality validation', duration);
    }
  }

  /**
   * Validate file integrity
   */
  async validateFileIntegrity(artifactPath, results) {
    this.performance.start('integrity_validation');
    this.logger.debug('Validating file integrity');

    try {
      const dashboardPath = path.join(artifactPath, 'index.html');
      
      if (!fs.existsSync(dashboardPath)) {
        return; // Already reported
      }

      // Check file permissions
      try {
        await fs.promises.access(dashboardPath, fs.constants.R_OK);
      } catch (error) {
        results.errors.push('Dashboard file is not readable');
        return;
      }

      // Check for file corruption indicators
      const content = await fs.promises.readFile(dashboardPath, 'utf8');
      
      // Check for incomplete HTML (missing closing tags)
      const openTags = (content.match(/<[^/][^>]*>/g) || []).length;
      const closeTags = (content.match(/<\/[^>]*>/g) || []).length;
      const selfClosingTags = (content.match(/<[^>]*\/>/g) || []).length;
      
      // Rough estimate - should be close to balanced
      if (Math.abs(openTags - closeTags - selfClosingTags) > 5) {
        results.warnings.push('HTML tag structure appears unbalanced - possible corruption');
      }

      // Check for binary data in text file
      const binaryPattern = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
      if (binaryPattern.test(content)) {
        results.errors.push('Binary data detected in HTML file - file may be corrupted');
      }

      // Check for minimum expected file size based on typical dashboard content
      const stats = await fs.promises.stat(dashboardPath);
      if (stats.size < 2000) {
        results.warnings.push(`Dashboard file unusually small (${stats.size} bytes)`);
      } else if (stats.size > 500000) {
        results.warnings.push(`Dashboard file unusually large (${stats.size} bytes)`);
      }

      results.files.dashboard = {
        ...results.files.dashboard,
        integrity: {
          openTags,
          closeTags,
          selfClosingTags,
          tagBalance: openTags - closeTags - selfClosingTags,
          hasBinaryData: binaryPattern.test(content),
          fileSize: stats.size
        }
      };

      this.logger.debug('File integrity validation completed', {
        fileSize: stats.size,
        tagBalance: openTags - closeTags - selfClosingTags
      });

    } catch (error) {
      results.errors.push(`File integrity validation failed: ${error.message}`);
    } finally {
      const duration = this.performance.stop('integrity_validation');
      this.logger.logPerformance('Integrity validation', duration);
    }
  }

  /**
   * Generate validation report
   */
  generateValidationReport(results) {
    let report = `# 🔍 Security Dashboard Artifact Validation Report\n\n`;
    report += `**Validation Time:** ${new Date().toUTCString()}\n`;
    report += `**Overall Status:** ${results.success ? '✅ PASSED' : '❌ FAILED'}\n\n`;

    if (results.errors.length > 0) {
      report += `## ❌ Errors (${results.errors.length})\n\n`;
      results.errors.forEach((error, index) => {
        report += `${index + 1}. ${error}\n`;
      });
      report += '\n';
    }

    if (results.warnings.length > 0) {
      report += `## ⚠️ Warnings (${results.warnings.length})\n\n`;
      results.warnings.forEach((warning, index) => {
        report += `${index + 1}. ${warning}\n`;
      });
      report += '\n';
    }

    if (results.files.dashboard) {
      report += `## 📊 File Information\n\n`;
      report += `- **Dashboard Size:** ${results.files.dashboard.size || 'Unknown'} bytes\n`;
      if (results.files.dashboard.integrity) {
        report += `- **Tag Balance:** ${results.files.dashboard.integrity.tagBalance}\n`;
        report += `- **Has Binary Data:** ${results.files.dashboard.integrity.hasBinaryData ? 'Yes' : 'No'}\n`;
      }
      if (results.files.checksum) {
        report += `- **Checksum:** ${results.files.checksum.checksum ? 'Valid' : 'Invalid'}\n`;
      }
      report += '\n';
    }

    if (results.metrics.totalValidationTime) {
      report += `## ⏱️ Performance Metrics\n\n`;
      report += `- **Total Validation Time:** ${results.metrics.totalValidationTime}ms\n\n`;
    }

    if (results.success) {
      report += `## ✅ Validation Passed\n\n`;
      report += `The security dashboard artifact has passed all validation checks and is ready for upload.\n`;
    } else {
      report += `## ❌ Validation Failed\n\n`;
      report += `The security dashboard artifact has failed validation. Please review the errors above and regenerate the dashboard.\n`;
    }

    return report;
  }
}

module.exports = DashboardArtifactValidator;