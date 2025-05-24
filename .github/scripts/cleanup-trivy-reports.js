#!/usr/bin/env node

/**
 * cleanup-trivy-reports.js
 * 
 * This script manages Trivy security reports by:
 * - Keeping only the latest N reports (default: 10)
 * - Removing reports older than X days (default: 30)
 * - Generating a summary index of all reports
 */

import fs from 'fs/promises';
import path from 'path';

const TRIVY_LOGS_DIR = 'logs/trivy';
const MAX_REPORTS = 10;
const MAX_AGE_DAYS = 30;

async function cleanupTrivyReports() {
  try {
    console.log('🧹 Cleaning up Trivy security reports...');
    
    // Ensure directory exists
    await fs.mkdir(TRIVY_LOGS_DIR, { recursive: true });
    
    // Get all report files
    const files = await fs.readdir(TRIVY_LOGS_DIR);
    const reportFiles = files.filter(file => 
      file.startsWith('trivy-report-') && (file.endsWith('.md') || file.endsWith('.json'))
    );
    
    if (reportFiles.length === 0) {
      console.log('📝 No Trivy reports found');
      return;
    }
    
    // Sort files by timestamp (newest first)
    const sortedFiles = reportFiles.sort((a, b) => {
      const timestampA = extractTimestamp(a);
      const timestampB = extractTimestamp(b);
      return timestampB.localeCompare(timestampA);
    });
    
    // Group by timestamp (md and json files together)
    const reportGroups = {};
    sortedFiles.forEach(file => {
      const timestamp = extractTimestamp(file);
      if (!reportGroups[timestamp]) {
        reportGroups[timestamp] = [];
      }
      reportGroups[timestamp].push(file);
    });
    
    const timestamps = Object.keys(reportGroups).sort().reverse();
    
    // Remove old reports (keep only MAX_REPORTS newest)
    if (timestamps.length > MAX_REPORTS) {
      const toRemove = timestamps.slice(MAX_REPORTS);
      console.log(`🗑️  Removing ${toRemove.length} old report groups (keeping ${MAX_REPORTS} newest)`);
      
      for (const timestamp of toRemove) {
        for (const file of reportGroups[timestamp]) {
          await fs.unlink(path.join(TRIVY_LOGS_DIR, file));
          console.log(`   Removed: ${file}`);
        }
      }
    }
    
    // Remove reports older than MAX_AGE_DAYS
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - MAX_AGE_DAYS);
    const cutoffTimestamp = formatTimestamp(cutoffDate);
    
    for (const timestamp of timestamps) {
      if (timestamp < cutoffTimestamp) {
        console.log(`📅 Removing reports older than ${MAX_AGE_DAYS} days: ${timestamp}`);
        for (const file of reportGroups[timestamp]) {
          try {
            await fs.unlink(path.join(TRIVY_LOGS_DIR, file));
            console.log(`   Removed: ${file}`);
          } catch (error) {
            // File might already be removed
          }
        }
      }
    }
    
    // Generate index file
    await generateReportIndex();
    
    console.log('✅ Trivy reports cleanup completed');
    
  } catch (error) {
    console.error('❌ Error cleaning up Trivy reports:', error.message);
  }
}

function extractTimestamp(filename) {
  const match = filename.match(/trivy-report-(\d{8}_\d{6})/);
  return match ? match[1] : '00000000_000000';
}

function formatTimestamp(date) {
  return date.toISOString()
    .replace(/[-:]/g, '')
    .replace('T', '_')
    .substring(0, 15);
}

async function generateReportIndex() {
  try {
    const files = await fs.readdir(TRIVY_LOGS_DIR);
    const mdReports = files
      .filter(file => file.startsWith('trivy-report-') && file.endsWith('.md'))
      .sort()
      .reverse();
    
    let index = '# Trivy Security Reports Index\n\n';
    index += `Last updated: ${new Date().toISOString()}\n\n`;
    index += `Total reports: ${mdReports.length}\n\n`;
    
    if (mdReports.length > 0) {
      index += '## Available Reports\n\n';
      for (const report of mdReports) {
        const timestamp = extractTimestamp(report);
        const date = parseTimestamp(timestamp);
        index += `- [${date}](${report})\n`;
      }
    } else {
      index += 'No reports available.\n';
    }
    
    await fs.writeFile(path.join(TRIVY_LOGS_DIR, 'README.md'), index);
    console.log('📋 Generated report index: logs/trivy/README.md');
    
  } catch (error) {
    console.error('❌ Error generating report index:', error.message);
  }
}

function parseTimestamp(timestamp) {
  const year = timestamp.substring(0, 4);
  const month = timestamp.substring(4, 6);
  const day = timestamp.substring(6, 8);
  const hour = timestamp.substring(9, 11);
  const minute = timestamp.substring(11, 13);
  const second = timestamp.substring(13, 15);
  
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

// Run cleanup if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupTrivyReports().catch(console.error);
}

export default cleanupTrivyReports;
