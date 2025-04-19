/**
 * Script to generate database schema documentation from Mongoose models
 *
 * This script scans the server/models directory, analyzes each Mongoose model,
 * and generates markdown documentation describing the schema structure.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to models directory
const modelsDir = path.join(__dirname, '../server/models');
// Output file path
const outputFile = path.join(__dirname, '../docs/DATABASE_SCHEMA_DETAIL.MD');

// Function to extract schema information from a model file
async function extractSchemaInfo(filePath) {
  try {
    // Clear mongoose models to prevent duplicate model errors
    mongoose.models = {};
    mongoose.modelSchemas = {};

    // Import the model file
    const modelModule = await import(filePath);
    const modelName = path.basename(filePath, '.js').replace(/-/g, '');

    // Get the model and schema
    let model;
    // Check default export first
    if (
      modelModule.default &&
      typeof modelModule.default === 'function' &&
      modelModule.default.modelName
    ) {
      model = modelModule.default;
    } else {
      // Check named exports
      for (const key in modelModule) {
        if (typeof modelModule[key] === 'function' && modelModule[key].modelName) {
          model = modelModule[key];
          break;
        }
      }
    }

    if (!model) {
      console.warn(`Could not find model in ${filePath}`);
      return null;
    }

    const schema = model.schema;

    // Extract schema paths
    const paths = {};
    schema.eachPath((pathName, schemaType) => {
      // Skip internal Mongoose fields
      if (pathName === '__v') return;

      let type = schemaType.instance || 'Mixed';
      let isRequired = false;
      let isUnique = false;
      let defaultValue = undefined;
      let enumValues = undefined;
      let ref = undefined;

      // Extract options
      if (schemaType.options) {
        if (schemaType.options.required) isRequired = true;
        if (schemaType.options.unique) isUnique = true;
        if (schemaType.options.default !== undefined) {
          defaultValue =
            typeof schemaType.options.default === 'function'
              ? 'Function'
              : JSON.stringify(schemaType.options.default);
        }
        if (schemaType.options.enum) enumValues = schemaType.options.enum;
        if (schemaType.options.ref) ref = schemaType.options.ref;
      }

      // Handle array types
      if (type === 'Array' && schemaType.schema) {
        type = 'Array of Documents';
      } else if (type === 'Array' && schemaType.caster) {
        type = `Array of ${schemaType.caster.instance || 'Mixed'}`;
        if (schemaType.caster.options && schemaType.caster.options.ref) {
          ref = schemaType.caster.options.ref;
        }
      }

      // Handle object types with nested schemas
      if (type === 'Object' && schemaType.schema) {
        type = 'Nested Document';
      }

      paths[pathName] = {
        type,
        required: isRequired,
        unique: isUnique,
        default: defaultValue,
        enum: enumValues,
        ref,
      };
    });

    // Extract indexes
    const indexes = [];
    if (schema._indexes) {
      schema._indexes.forEach(([fields, options]) => {
        indexes.push({
          fields: JSON.stringify(fields),
          options: JSON.stringify(options),
        });
      });
    }

    return {
      name: model.modelName,
      collection: model.collection.name,
      paths,
      indexes,
    };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return null;
  }
}

// Function to generate markdown documentation
function generateMarkdown(schemas) {
  let markdown = `# Database Schema Documentation\n\n`;

  // Table of contents
  markdown += `## Table of Contents\n\n`;
  schemas.forEach(schema => {
    if (schema) {
      markdown += `- [${schema.name}](#${schema.name.toLowerCase()})\n`;
    }
  });
  markdown += '\n';

  // Schema details
  schemas.forEach(schema => {
    if (!schema) return;

    markdown += `## ${schema.name}\n\n`;
    markdown += `**Collection:** \`${schema.collection}\`\n\n`;

    // Fields table
    markdown += `### Fields\n\n`;
    markdown += `| Field | Type | Required | Unique | Default | Enum | Reference |\n`;
    markdown += `| ----- | ---- | -------- | ------ | ------- | ---- | --------- |\n`;

    Object.entries(schema.paths).forEach(([pathName, info]) => {
      const required = info.required ? '✓' : '';
      const unique = info.unique ? '✓' : '';
      const defaultValue = info.default !== undefined ? info.default : '';
      const enumValues = info.enum ? `[${info.enum.join(', ')}]` : '';
      const ref = info.ref ? `\`${info.ref}\`` : '';

      markdown += `| \`${pathName}\` | ${info.type} | ${required} | ${unique} | ${defaultValue} | ${enumValues} | ${ref} |\n`;
    });

    markdown += '\n';

    // Indexes table
    if (schema.indexes && schema.indexes.length > 0) {
      markdown += `### Indexes\n\n`;
      markdown += `| Fields | Options |\n`;
      markdown += `| ------ | ------- |\n`;

      schema.indexes.forEach(index => {
        markdown += `| ${index.fields} | ${index.options} |\n`;
      });

      markdown += '\n';
    }

    markdown += '---\n\n';
  });

  return markdown;
}

// Main function
async function main() {
  try {
    // Get all model files
    const files = fs
      .readdirSync(modelsDir)
      .filter(file => file.endsWith('.js'))
      .map(file => path.join(modelsDir, file));

    // Extract schema information from each file
    const schemaPromises = files.map(file => extractSchemaInfo(file));
    const schemaResults = await Promise.all(schemaPromises);
    const schemas = schemaResults
      .filter(schema => schema !== null)
      .sort((a, b) => a.name.localeCompare(b.name));

    // Generate markdown
    const markdown = generateMarkdown(schemas);

    // Write to output file
    fs.writeFileSync(outputFile, markdown);

    console.log(`Database schema documentation generated at ${outputFile}`);
  } catch (error) {
    console.error('Error generating schema documentation:', error);
    process.exit(1);
  }
}

// Run the main function
main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
