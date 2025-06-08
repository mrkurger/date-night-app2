// scripts/convert-to-esm.js
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IGNORED_DIRS = ['node_modules', '.git', 'dist', 'build', 'coverage', 'backup-*'];
const IGNORED_FILES = [
  '.cjs',
  '.json',
  '.md',
  '.txt',
  '.log',
  '.env',
  '.gitignore',
  '.npmrc',
  '.DS_Store',
  '.eslintrc',
];

// Conversion patterns
const CONVERSION_PATTERNS = [
  // require to import
  {
    test: /const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\)/g,
    replace: (match, varName, modulePath) => {
      // Handle special cases for common Node.js built-ins
      const builtins = {
        fs: 'fs/promises',
        path: 'path',
        url: 'url',
        util: 'util',
      };

      const importPath = builtins[modulePath] || modulePath;
      return `import ${varName} from '${importPath}'`;
    },
  },
  // module.exports to export
  {
    test: /module\.exports\s*=\s*({[\s\S]*?})/g,
    replace: (match, exports) => `export default ${exports}`,
  },
  // module.exports.something to export const
  {
    test: /module\.exports\.(\w+)\s*=\s*([\s\S]*?);/g,
    replace: (match, exportName, value) => `export const ${exportName} = ${value};`,
  },
  // destructured require to import
  {
    test: /const\s*{\s*([\w\s,]+)}\s*=\s*require\(['"]([^'"]+)['"]\)/g,
    replace: (match, imports, modulePath) => {
      const cleanImports = imports
        .split(',')
        .map(i => i.trim())
        .join(', ');
      return `import { ${cleanImports} } from '${modulePath}'`;
    },
  },
  // require without assignment to import
  {
    test: /require\(['"]([^'"]+)['"]\);/g,
    replace: (match, modulePath) => `import '${modulePath}';`,
  },
];

async function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  const basename = path.basename(filePath);

  // Skip ignored files and patterns
  if (
    IGNORED_FILES.some(ignored => {
      if (ignored.startsWith('.')) {
        return basename.startsWith(ignored);
      }
      return filePath.includes(ignored);
    })
  ) {
    return false;
  }

  // Only process .js files and package.json
  return ext === '.js' || basename === 'package.json';
}

async function convertFile(filePath) {
  try {
    let content = await fsPromises.readFile(filePath, 'utf-8');
    let modified = false;

    // Add .js extension to relative imports if missing
    content = content.replace(/from\s+['"](\.[^'"]+)['"]([;\s])/g, (match, importPath, ending) => {
      if (!path.extname(importPath)) {
        return `from '${importPath}.js'${ending}`;
      }
      return match;
    });

    // Apply conversion patterns
    for (const pattern of CONVERSION_PATTERNS) {
      const originalContent = content;
      content = content.replace(pattern.test, pattern.replace);
      if (originalContent !== content) {
        modified = true;
      }
    }

    // Add type="module" to package.json if it's missing
    if (path.basename(filePath) === 'package.json') {
      try {
        const packageJson = JSON.parse(content);
        if (!packageJson.type) {
          packageJson.type = 'module';
          content = JSON.stringify(packageJson, null, 2);
          modified = true;
        }
      } catch (e) {
        console.error(`Error parsing package.json: ${e.message}`);
      }
    }

    if (modified) {
      await fsPromises.writeFile(filePath, content, 'utf-8');
      console.log(`✅ Converted: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error converting ${filePath}:`, error.message);
    return false;
  }
}

async function createBackup(directory) {
  const backupDir = path.join(directory, `backup-${Date.now()}`);
  console.log(`📦 Creating backup in: ${backupDir}`);

  try {
    await fsPromises.mkdir(backupDir, { recursive: true });

    async function copyRecursive(src) {
      try {
        const entries = await fsPromises.readdir(src, { withFileTypes: true });

        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(backupDir, path.relative(directory, srcPath));

          // Skip ignored directories and files
          if (
            IGNORED_DIRS.some(ignored => {
              if (ignored.includes('*')) {
                const pattern = new RegExp(ignored.replace('*', '.*'));
                return pattern.test(entry.name);
              }
              return entry.name === ignored;
            })
          ) {
            continue;
          }

          try {
            if (entry.isDirectory()) {
              await fsPromises.mkdir(destPath, { recursive: true });
              await copyRecursive(srcPath);
            } else {
              if (await shouldProcessFile(srcPath)) {
                await fsPromises.mkdir(path.dirname(destPath), { recursive: true });
                await fsPromises.copyFile(srcPath, destPath);
              }
            }
          } catch (err) {
            if (err.code !== 'ENOENT') {
              console.warn(`⚠️ Warning: Could not copy ${srcPath}: ${err.message}`);
            }
          }
        }
      } catch (err) {
        if (err.code !== 'ENOENT') {
          console.warn(`⚠️ Warning: Could not process directory ${src}: ${err.message}`);
        }
      }
    }

    await copyRecursive(directory);
    console.log('✅ Backup created successfully');
    return true;
  } catch (error) {
    console.error('❌ Error creating backup:', error.message);
    return false;
  }
}

async function processDirectory(dirPath) {
  try {
    const files = await fsPromises.readdir(dirPath);
    let convertedCount = 0;

    for (const file of files) {
      const fullPath = path.join(dirPath, file);

      try {
        const stats = await fsPromises.stat(fullPath);

        if (stats.isDirectory()) {
          // Skip ignored directories
          if (
            IGNORED_DIRS.some(ignored => {
              if (ignored.includes('*')) {
                const pattern = new RegExp(ignored.replace('*', '.*'));
                return pattern.test(file);
              }
              return file === ignored;
            })
          ) {
            continue;
          }
          convertedCount += await processDirectory(fullPath);
        } else if (await shouldProcessFile(fullPath)) {
          const converted = await convertFile(fullPath);
          if (converted) convertedCount++;
        }
      } catch (err) {
        if (err.code !== 'ENOENT') {
          console.warn(`⚠️ Warning: Could not process ${fullPath}: ${err.message}`);
        }
      }
    }

    return convertedCount;
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.warn(`⚠️ Warning: Could not read directory ${dirPath}: ${err.message}`);
    }
    return 0;
  }
}

async function main() {
  const rootDir = path.resolve(__dirname, '..');

  // Add type: "module" to package.json first
  try {
    const packageJsonPath = path.join(rootDir, 'package.json');
    const packageJson = JSON.parse(await fsPromises.readFile(packageJsonPath, 'utf-8'));
    if (!packageJson.type) {
      packageJson.type = 'module';
      await fsPromises.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('✅ Added "type": "module" to package.json');
    }
  } catch (error) {
    console.error('❌ Error updating package.json:', error.message);
    process.exit(1);
  }

  // Create backup
  const backupSuccess = await createBackup(rootDir);
  if (!backupSuccess) {
    console.log(
      '⚠️ Proceeding without backup. Press Ctrl+C to cancel or any other key to continue...',
    );
    await new Promise(resolve => {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on('data', data => {
        if (data[0] === 3) process.exit(1); // Ctrl+C
        process.stdin.setRawMode(false);
        resolve();
      });
    });
  }

  console.log('🔄 Starting conversion process...');
  const convertedCount = await processDirectory(rootDir);
  console.log(`✨ Conversion complete! Converted ${convertedCount} files.`);

  console.log('\n📝 Next steps:');
  console.log('1. Review the changes in your code editor');
  console.log('2. Run your tests to ensure everything works');
  console.log('3. Update any build configurations or scripts if needed');
  console.log('4. Check for any remaining CommonJS patterns that might need manual attention');
}

main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
