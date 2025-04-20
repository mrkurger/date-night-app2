# Contributing Guidelines

This document outlines the process for contributing to the DateNight.io project. Please follow these guidelines to ensure a smooth collaboration process.

## Table of Contents

- [Code Style](#code-style)
- [Branching Strategy](#branching-strategy)
- [Commit Message Format](#commit-message-format)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Issue Tracking](#issue-tracking)
- [Code Review](#code-review)

## Code Style

All code contributions must adhere to our established code style guidelines. This ensures consistency across the codebase and makes it easier for all contributors to understand and maintain the code.

- **Angular/TypeScript**: Follow the [Angular Style Guide](https://angular.io/guide/styleguide)
- **JavaScript (Node.js)**: Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- **CSS/SCSS**: Follow the [BEM methodology](http://getbem.com/) for class naming

For detailed formatting rules, linting configuration, and editor setup, please refer to our [CODE_FORMATTING.MD](/docs/CODE_FORMATTING.MD) guide.

## Branching Strategy

We use a Git Flow-inspired branching strategy:

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/[feature-name]**: For new features
- **bugfix/[bug-name]**: For bug fixes
- **hotfix/[hotfix-name]**: For urgent production fixes
- **release/[version]**: For release preparation

### Branch Naming Conventions

- Use lowercase letters and hyphens
- Include a descriptive name that reflects the purpose
- Include the issue number when applicable

Examples:

- `feature/user-profile-redesign`
- `bugfix/login-validation-error`
- `hotfix/security-vulnerability-fix`
- `feature/DN-123-add-payment-method`

## Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Changes that do not affect the meaning of the code (formatting, etc.)
- **refactor**: Code changes that neither fix a bug nor add a feature
- **perf**: Performance improvements
- **test**: Adding or correcting tests
- **chore**: Changes to the build process or auxiliary tools

### Examples

```
feat(auth): add social login with Google

Implement OAuth2 authentication with Google accounts.
Includes new login button, service methods, and API endpoints.

Closes #123
```

```
fix(chat): resolve message delivery status not updating

The message delivery status was not updating due to a race condition
in the WebSocket event handling.

Fixes #456
```

## Pull Request Process

1. **Create a branch** from `develop` (or `main` for hotfixes)
2. **Implement your changes** following our code style guidelines
3. **Write tests** for your changes
4. **Update documentation** as needed
5. **Submit a pull request** to the appropriate branch
6. **Address review feedback** and make necessary changes
7. **Wait for approval** from at least one maintainer
8. **Merge** the pull request (done by maintainers)

### Pull Request Template

When creating a pull request, please use our template which includes:

- Description of changes
- Related issue(s)
- Type of change (bugfix, feature, etc.)
- Checklist of completed items
- Screenshots or videos (if applicable)
- Testing instructions

## Testing Requirements

All code contributions must include appropriate tests:

- **Unit tests** for individual components and services
- **Integration tests** for API endpoints and complex interactions
- **End-to-end tests** for critical user flows

Tests should cover:

- Happy path scenarios
- Edge cases
- Error handling
- Performance considerations (for critical paths)

For detailed testing guidelines, patterns, and examples, please refer to our [TESTING_GUIDE.MD](/docs/TESTING_GUIDE.MD).

## Documentation

Code changes often require documentation updates:

- **Code comments**: Add JSDoc comments for public APIs and complex logic
- **README updates**: If your changes affect setup, configuration, or usage
- **Feature documentation**: Update or create feature documentation in the `/docs/features` directory
- **API documentation**: Update Swagger/OpenAPI annotations for API changes

## Issue Tracking

- Before starting work, ensure there's an issue describing the problem or feature
- Reference the issue number in your commit messages and pull request
- Use issue labels appropriately (bug, feature, documentation, etc.)
- Update issue status as you progress

## Code Review

- All pull requests require at least one review from a maintainer
- Reviewers will check for:
  - Code quality and style
  - Test coverage
  - Documentation
  - Performance implications
  - Security considerations
- Address all review comments before requesting re-review
- Be respectful and constructive in review discussions

Thank you for contributing to DateNight.io! Your efforts help make this project better for everyone.
