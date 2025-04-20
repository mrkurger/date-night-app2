# Code Formatting Guidelines

This document outlines the code formatting standards and tools used in the Date Night App project.

## Tools and Configuration

The project uses the following tools to ensure consistent code formatting and quality:

- **ESLint**: For static code analysis and enforcing coding standards
- **Prettier**: For automatic code formatting
- **Husky**: For Git hooks to enforce standards before commits
- **lint-staged**: For running linters on staged files

## Setup

The formatting tools are already configured in the project. Here's what's included:

### Server (Node.js)

- ESLint configuration in `server/.eslintrc.json`
- Prettier configuration in `server/.prettierrc`
- npm scripts for linting and formatting

### Client (Angular)

- ESLint configuration in `client-angular/.eslintrc.json`
- Prettier configuration in `client-angular/.prettierrc`
- npm scripts for linting and formatting

### Root Project

- Git hooks with Husky in `.husky/`
- lint-staged configuration in `.lintstagedrc.json`
- VSCode settings in `.vscode/settings.json`

## Available Commands

### Server Commands

```bash
# In the server directory
npm run lint           # Check for linting issues
npm run lint:fix       # Fix linting issues
npm run format         # Format code with Prettier
npm run format:check   # Check if code is formatted correctly
```

### Client Commands

```bash
# In the client-angular directory
npm run lint           # Check and fix linting issues
npm run lint:check     # Check for linting issues without fixing
npm run format         # Format code with Prettier
npm run format:check   # Check if code is formatted correctly
npm run format:all     # Run both formatting and linting
```

### Root Project Commands

```bash
# In the root directory
npm run lint           # Run linting for both server and client
npm run lint:fix       # Fix linting issues for both server and client
npm run format         # Format code for both server and client
npm run format:check   # Check formatting for both server and client
npm run format:all     # Run both formatting and linting for the entire project
```

## Git Hooks

The project uses Husky to set up Git hooks:

- **pre-commit**: Runs lint-staged to check and format staged files before committing

## VSCode Integration

If you're using VSCode, the project includes settings for automatic formatting:

- Format on save is enabled
- ESLint and Prettier extensions are configured
- Language-specific formatters are set

## Coding Standards

### JavaScript/Node.js

- Follow the ESLint recommended rules
- Use single quotes for strings
- Use semicolons at the end of statements
- Maximum line length of 100 characters
- 2 spaces for indentation

### TypeScript/Angular

- Follow the Angular style guide
- Use explicit member accessibility modifiers
- Use single quotes for strings
- Maximum line length of 100 characters
- 2 spaces for indentation

## Troubleshooting

If you encounter issues with the formatting tools:

1. Make sure all dependencies are installed:

   ```bash
   npm install
   ```

2. If Git hooks aren't working, try reinstalling Husky:

   ```bash
   npm run prepare
   ```

3. For VSCode integration issues, make sure you have the ESLint and Prettier extensions installed.

## Customizing the Configuration

If you need to customize the formatting rules:

1. Edit the `.eslintrc.json` files for linting rules
2. Edit the `.prettierrc` files for formatting rules
3. Update the `.lintstagedrc.json` file for pre-commit behavior
4. Modify the `.vscode/settings.json` file for editor integration
