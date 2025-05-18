import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Ensures a directory exists
 * @param {string} dirPath - Directory path to create
 * @returns {void}
 */
function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Creates required HTML documentation files if missing
 * @param {string} dirPath - Directory path to check/create docs
 * @returns {Promise<void>}
 */
const ensureDocs = async (dirPath) => {
  const requiredDocs = {
    'CHANGELOG.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Changelog</title>
    <style>
        body { font-family: system-ui; max-width: 800px; margin: 0 auto; padding: 2rem; }
    </style>
</head>
<body>
    <h1>Changelog</h1>
    <p>Document changes here...</p>
</body>
</html>`,
    'AILESSONS.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>AI Lessons</title>
    <style>
        body { font-family: system-ui; max-width: 800px; margin: 0 auto; padding: 2rem; }
    </style>
</head>
<body>
    <h1>AI Lessons</h1>
    <p>Document AI-learned patterns here...</p>
</body>
</html>`,
    'GLOSSARY.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Glossary</title>
    <style>
        body { font-family: system-ui; max-width: 800px; margin: 0 auto; padding: 2rem; }
    </style>
</head>
<body>
    <h1>Glossary</h1>
    <p>Auto-generated entries will appear here...</p>
</body>
</html>`
  };

  try {
    // Ensure directory exists
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }

    // Create missing docs
    for (const [filename, content] of Object.entries(requiredDocs)) {
      const filePath = join(dirPath, filename);
      if (!existsSync(filePath)) {
        writeFileSync(filePath, content);
        console.log(`✅ Created ${filename} in ${dirPath}`);
      }
    }
  } catch (error) {
    console.error(`❌ Error ensuring docs in ${dirPath}:`, error.message);
    process.exit(1);
  }
};

// Ensure docs exist in current directory
ensureDocs(process.cwd());

// Also ensure docs exist in .github folder
ensureDocs(join(process.cwd(), '.github'));