#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "Warning: .env file not found"
fi

# Validate required environment variables
required_vars=("GITHUB_PERSONAL_ACCESS_TOKEN" "PROJECT_ROOT" "LSP_MCP_PATH")

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: $var is not set"
        exit 1
    fi
done

# Generate the MCP configuration with environment variable substitution
envsubst < mcp.template.json > .vscode/mcp.json

echo "MCP configuration generated successfully!"
