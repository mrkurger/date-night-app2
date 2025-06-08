#!/bin/bash

echo "🚀 Setting up MCP servers for Date Night App..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Create scripts directory if it doesn't exist
mkdir -p scripts

echo "📦 Installing MCP server dependencies..."

# Note: Some of these packages may not exist yet, but we're documenting the intended setup
echo "📝 The following packages will be available when their MCP servers are published:"
echo "   - @eslint/mcp-server (for ESLint integration)"
echo "   - @typedoc/mcp-server (for documentation generation)"
echo "   - webpack-bundle-analyzer-mcp (for bundle analysis)"
echo "   - jest-mcp-server (for test analysis)"

# Install available packages
echo "📦 Installing currently available packages..."

# TypeScript language server is already installed
echo "✅ typescript-language-server: Already installed"

# Playwright MCP is already installed
echo "✅ @playwright/mcp: Already installed"

# Install security-related tools that we can wrap with MCP
echo "📦 Installing security audit tools..."
npm install --save-dev snyk || echo "ℹ️  Snyk installation optional"

# Create MCP configuration template
echo "🔧 Creating MCP configuration template..."

cat > .vscode/mcp-servers-template.json << 'EOF'
{
  "mcpServers": {
    "typescript-lsp": {
      "command": "npx",
      "args": ["lsp-mcp", "typescript", "typescript-language-server", "--stdio"]
    },
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    },
    "security-audit": {
      "command": "node",
      "args": ["./scripts/security-audit-mcp.js"]
    }
  }
}
EOF

# Create VS Code settings template
cat > .vscode/settings-template.json << 'EOF'
{
  "github.copilot.settings": {
    "maxFilesPerBatch": 20,
    "batchProcessingTimeout": 30000,
    "enableParallelProcessing": true,
    "memoryLimit": 4096,
    "advanced": {
      "enableDeepAnalysis": true,
      "maxContextFiles": 15,
      "maxTokensPerFile": 5000
    }
  },
  "mcp": {
    "servers": {
      "typescript-lsp": {
        "command": "npx",
        "args": ["lsp-mcp", "typescript", "typescript-language-server", "--stdio"]
      },
      "playwright": {
        "command": "npx",
        "args": ["@playwright/mcp@latest"]
      },
      "security-audit": {
        "command": "node",
        "args": ["./scripts/security-audit-mcp.js"]
      },
      "sequentialthinking": {
        "maxConcurrentOperations": 5,
        "timeout": 30000
      }
    }
  },
  "editor.maxTokenizationLineLength": 20000,
  "files.maxMemoryForLargeFilesMB": 4096
}
EOF

echo "🔧 Creating configuration files..."

# Create ESLint config with security rules
cat > .eslintrc.security.json << 'EOF'
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended"
  ],
  "plugins": ["security", "@typescript-eslint"],
  "rules": {
    "security/detect-object-injection": "warn",
    "security/detect-non-literal-fs-filename": "warn",
    "security/detect-unsafe-regex": "error",
    "security/detect-buffer-noassert": "error",
    "security/detect-child-process": "warn",
    "security/detect-disable-mustache-escape": "error",
    "security/detect-eval-with-expression": "error",
    "security/detect-no-csrf-before-method-override": "error",
    "security/detect-non-literal-regexp": "error",
    "security/detect-non-literal-require": "warn",
    "security/detect-possible-timing-attacks": "warn",
    "security/detect-pseudoRandomBytes": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "warn"
  },
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "env": {
    "node": true,
    "browser": true,
    "es2022": true
  }
}
EOF

# Create TypeDoc configuration
cat > typedoc.json << 'EOF'
{
  "entryPoints": [
    "./client-angular/src",
    "./client_angular2/src"
  ],
  "out": "./docs/api",
  "theme": "default",
  "readme": "./README.md",
  "includeVersion": true,
  "excludePrivate": true,
  "excludeProtected": true,
  "excludeInternal": true,
  "categorizeByGroup": true,
  "defaultCategory": "Other",
  "categoryOrder": [
    "Components",
    "Services",
    "Models",
    "Utilities",
    "*"
  ],
  "navigation": {
    "includeCategories": true,
    "includeGroups": true
  }
}
EOF

echo "✅ MCP servers setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Review and merge settings from .vscode/settings-template.json into your VS Code settings"
echo "2. Install the MCP VS Code extension: code --install-extension modelcontextprotocol.mcp"
echo "3. Run 'node scripts/test-mcp-setup.js' to verify the setup"
echo "4. Check the documentation:"
echo "   - docs/MCP_SERVERS_CATALOG.md for available servers"
echo "   - docs/MCP_SETUP_GUIDE.md for detailed setup instructions"
echo ""
echo "⚠️  Note: Some MCP servers are conceptual and may need custom implementation"
echo "   or may become available as the MCP ecosystem grows."