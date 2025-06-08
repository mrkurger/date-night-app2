/**
 * Script to fix verification controller stub
 *
 * This script ensures the verification controller is properly exported
 * and compatible with both JavaScript and TypeScript imports.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get server root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, '..');
const distDir = path.join(serverRoot, 'dist');

// Check if the verification controller exists in the dist directory
const verificationControllerPath = path.join(distDir, 'controllers', 'verification.controller.js');

function fixVerificationController() {
  console.log('Fixing verification controller exports...');

  if (fs.existsSync(verificationControllerPath)) {
    let content = fs.readFileSync(verificationControllerPath, 'utf8');

    // Check if the controller is already properly exported
    if (
      !content.includes('export default') &&
      content.includes('export class VerificationController')
    ) {
      console.log('Adding default export to verification controller...');

      // Add default export at the end of the file
      content += `

// Create singleton instance for backwards compatibility
const verificationController = new VerificationController();

export default verificationController;
`;

      fs.writeFileSync(verificationControllerPath, content, 'utf8');
      console.log(`Updated ${verificationControllerPath}`);
    } else {
      console.log('Verification controller already has a default export.');
    }
  } else {
    console.log('Creating verification controller stub...');

    // Create a basic stub for the verification controller
    const stubContent = `/**
 * Verification Controller (stub)
 * 
 * Basic implementation of the verification controller with required methods.
 */

// Basic verification controller implementation
class VerificationController {
  // Get verification status for current user
  getVerificationStatus(req, res) {
    res.status(200).json({ status: 'pending', message: 'Verification status stub' });
  }

  // Submit identity verification
  submitIdentityVerification(req, res) {
    res.status(200).json({ success: true, message: 'Identity verification submitted (stub)' });
  }

  // Submit photo verification
  submitPhotoVerification(req, res) {
    res.status(200).json({ success: true, message: 'Photo verification submitted (stub)' });
  }

  // Submit phone verification
  submitPhoneVerification(req, res) {
    res.status(200).json({ success: true, message: 'Phone verification submitted (stub)' });
  }

  // Verify phone with code
  verifyPhoneWithCode(req, res) {
    res.status(200).json({ success: true, message: 'Phone verified (stub)' });
  }
  
  // Admin operations
  approveVerification(req, res) {
    res.status(200).json({ success: true, message: 'Verification approved (stub)' });
  }
  
  rejectVerification(req, res) {
    res.status(200).json({ success: true, message: 'Verification rejected (stub)' });
  }
  
  getAllPendingVerifications(req, res) {
    res.status(200).json({ verifications: [], message: 'No pending verifications (stub)' });
  }
}

// Create singleton instance for backwards compatibility
const verificationController = new VerificationController();

export default verificationController;
`;

    // Create directory if it doesn't exist
    const controllersDir = path.dirname(verificationControllerPath);
    if (!fs.existsSync(controllersDir)) {
      fs.mkdirSync(controllersDir, { recursive: true });
    }

    fs.writeFileSync(verificationControllerPath, stubContent, 'utf8');
    console.log(`Created ${verificationControllerPath}`);
  }
}

// Main function to run all fixes
function main() {
  console.log('Fixing verification controller compatibility issues...');

  fixVerificationController();

  console.log('Verification controller fixes completed!');
}

main();
