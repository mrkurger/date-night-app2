#!/usr/bin/env node

/**
 * Script to save the DateNight.io codebase review to Memory MCP server
 * This script connects to the memory MCP server and stores the review in the knowledge graph
 */

import { readFileSync } from 'fs';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEMORY_MCP_CONFIG = {
  command: 'docker',
  args: ['run', '-i', '--rm', '-v', 'augment-memory:/app/dist', 'mcp/memory'],
};

async function saveToMemoryMCP() {
  try {
    console.log('🔄 Connecting to Memory MCP server...');

    // Read the codebase review file
    const reviewPath = path.join(__dirname, '../docs/codebase-review-summary.md');
    const reviewContent = readFileSync(reviewPath, 'utf-8');

    // Prepare the memory entry
    const memoryEntry = {
      id: 'datenight-io-codebase-review-2025-01-09',
      content: reviewContent,
      metadata: {
        type: 'codebase_review',
        project: 'DateNight.io',
        technology_stack: 'MEAN',
        industry: 'Adult Entertainment/Classified Ads',
        review_date: '2025-01-09',
        version: '1.0.0',
        assessment: 'Excellent - Production Ready',
        key_features: [
          'Netflix-style browsing interface',
          'Tinder-style swipe interface',
          'Multi-provider OAuth authentication',
          'Geospatial travel itinerary system',
          'Advanced security with Argon2 password hashing',
          'Real-time chat system',
          'Subscription management with Stripe',
        ],
        technologies: [
          'Angular 19.2',
          'Node.js 22.14.0',
          'Express.js 5.1.0',
          'MongoDB 8.15.0',
          'Mongoose',
          'TypeScript 5.8.3',
          'TailwindCSS',
          'JWT Authentication',
          'Socket.IO',
          'Stripe',
          'Argon2',
          'Helmet.js',
        ],
        architecture_patterns: [
          'RESTful API',
          'Component-based architecture',
          'Lazy loading',
          'Role-based access control',
          'Geospatial indexing',
          'Token blacklisting',
          'Middleware pipeline',
        ],
        strengths: [
          'Enterprise-grade security implementation',
          'Innovative multi-interface UI design',
          'Comprehensive feature set',
          'Modern development practices',
          'Geospatial intelligence',
          'Safety-first approach',
        ],
        improvement_areas: [
          'Complete TypeScript migration',
          'Enhanced testing coverage',
          'Documentation completeness',
          'Build process optimization',
        ],
      },
      timestamp: new Date().toISOString(),
      tags: ['codebase', 'review', 'angular', 'nodejs', 'mongodb', 'security', 'ui-ux'],
    };

    // Create MCP request
    const mcpRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'add',
        arguments: memoryEntry,
      },
    };

    console.log('📝 Saving codebase review to memory...');

    // Spawn the memory MCP server process
    const mcpProcess = spawn(MEMORY_MCP_CONFIG.command, MEMORY_MCP_CONFIG.args, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Send the request
    mcpProcess.stdin.write(JSON.stringify(mcpRequest) + '\n');
    mcpProcess.stdin.end();

    // Handle response
    let responseData = '';
    mcpProcess.stdout.on('data', data => {
      responseData += data.toString();
    });

    mcpProcess.on('close', code => {
      if (code === 0) {
        console.log('✅ Successfully saved DateNight.io codebase review to Memory MCP!');
        console.log('📊 Review metadata:');
        console.log(`   - Project: ${memoryEntry.metadata.project}`);
        console.log(`   - Assessment: ${memoryEntry.metadata.assessment}`);
        console.log(`   - Technologies: ${memoryEntry.metadata.technologies.length} listed`);
        console.log(`   - Key Features: ${memoryEntry.metadata.key_features.length} highlighted`);

        if (responseData) {
          try {
            const response = JSON.parse(responseData);
            console.log('📋 MCP Response:', response);
          } catch (err) {
            console.log('📋 MCP Response (raw):', responseData);
          }
        }
      } else {
        console.error('❌ Failed to save to Memory MCP. Exit code:', code);
      }
    });

    mcpProcess.stderr.on('data', data => {
      console.error('🚨 MCP Error:', data.toString());
    });
  } catch (error) {
    console.error('❌ Error saving to Memory MCP:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Ensure Docker is running');
    console.log('2. Check if mcp/memory image is available: docker images | grep mcp/memory');
    console.log(
      '3. Verify the augment-memory volume exists: docker volume ls | grep augment-memory',
    );
    console.log('4. Try pulling the image: docker pull mcp/memory');
    console.log('5. Check your .vscode/mcp.json configuration');
  }
}

// Alternative function to test MCP connection
async function testMemoryMCPConnection() {
  console.log('🧪 Testing Memory MCP connection...');

  const testRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {},
  };

  const mcpProcess = spawn(MEMORY_MCP_CONFIG.command, MEMORY_MCP_CONFIG.args, {
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  mcpProcess.stdin.write(JSON.stringify(testRequest) + '\n');
  mcpProcess.stdin.end();

  let responseData = '';
  mcpProcess.stdout.on('data', data => {
    responseData += data.toString();
  });

  mcpProcess.on('close', code => {
    if (code === 0) {
      console.log('✅ Memory MCP connection successful!');
      console.log('📋 Available tools:', responseData);
    } else {
      console.log('❌ Memory MCP connection failed. Exit code:', code);
    }
  });
}

// Main execution
const command = process.argv[2];

switch (command) {
  case 'test':
    testMemoryMCPConnection();
    break;
  case 'save':
  default:
    saveToMemoryMCP();
    break;
}

console.log('\n💡 Usage:');
console.log('  node save-to-memory-mcp.js save    # Save the codebase review');
console.log('  node save-to-memory-mcp.js test    # Test MCP connection');
