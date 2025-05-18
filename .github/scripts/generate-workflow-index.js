import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Generates index of all workflows and their documentation
 * @returns {Promise<void>}
 */
async function generateWorkflowIndex() {
  try {
    // Find all workflow files
    const workflowFiles = await glob('**/*.{yml,yaml}', {
      cwd: join(__dirname, '..', 'workflows'),
      ignore: ['**/node_modules/**']
    });

    const workflowDocs = workflowFiles.map(file => {
      const content = readFileSync(join(__dirname, '..', 'workflows', file), 'utf8');
      const name = content.match(/name:\s*(.+)/)?.[1] || file;
      
      return {
        name: name.trim(),
        file,
        path: `./workflows/${file}`,
        docs: getWorkflowDocs(content)
      };
    });

    // Generate HTML
    const html = generateHTML(workflowDocs);
    
    // Write index file
    writeFileSync(join(__dirname, '..', 'workflows', 'index.html'), html);
    console.log('✅ Generated workflow index');
  } catch (error) {
    console.error('❌ Failed to generate workflow index:', error.message);
    process.exit(1);
  }
}

/**
 * Extracts documentation from workflow content
 * @param {string} content 
 * @returns {Object}
 */
function getWorkflowDocs(content) {
  const triggers = content.match(/on:\s*{([^}]+)}/s)?.[1] || '';
  const jobs = Object.keys((content.match(/jobs:\s*{([^}]+)}/s)?.[1] || '').trim());
  
  return {
    triggers: triggers.split('\n').map(line => line.trim()).filter(Boolean),
    jobs: jobs.filter(Boolean)
  };
}

/**
 * Generates HTML for workflow index
 * @param {Array<Object>} workflows 
 * @returns {string}
 */
function generateHTML(workflows) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Workflows Documentation</title>
    <style>
        body { font-family: system-ui; max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .workflow { margin-bottom: 2rem; padding: 1rem; border: 1px solid #eee; border-radius: 4px; }
        .workflow h2 { margin-top: 0; }
        .workflow-meta { color: #666; }
        pre { background: #f5f5f5; padding: 0.5rem; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>Workflows Documentation</h1>
    ${workflows.map(wf => `
    <article class="workflow">
        <h2>${wf.name}</h2>
        <div class="workflow-meta">
            <p>File: <code>${wf.file}</code></p>
            <h3>Triggers:</h3>
            <pre>${wf.docs.triggers.join('\n')}</pre>
            ${wf.docs.jobs.length ? `
            <h3>Jobs:</h3>
            <ul>
                ${wf.docs.jobs.map(job => `<li>${job}</li>`).join('')}
            </ul>
            ` : ''}
        </div>
    </article>
    `).join('')}
</body>
</html>`;
}

// Run if called directly
if (require.main === module) {
  generateWorkflowIndex();
}
