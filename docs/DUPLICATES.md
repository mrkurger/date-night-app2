# Code Duplication

This document tracks code duplication in the Date Night App project. Duplicated code should be refactored into shared components or utilities to improve maintainability.

## Table of Contents

- [Client-side Duplications](#client-side-duplications)
  - [Component Duplications](#component-duplications)
  - [Service Duplications](#service-duplications)
  - [Utility Duplications](#utility-duplications)
- [Server-side Duplications](#server-side-duplications)
  - [Controller Duplications](#controller-duplications)
  - [Middleware Duplications](#middleware-duplications)
  - [Model Duplications](#model-duplications)
- [Shared Duplications](#shared-duplications)
- [Refactoring Strategies](#refactoring-strategies)

## Client-side Duplications

### Component Duplications

| Duplicated Code | Locations | Refactoring Strategy | Status |
|-----------------|-----------|----------------------|--------|
| Ad Card Rendering | `client-angular/src/app/features/ads/components/ad-list/ad-list.component.ts` and `client-angular/src/app/features/ads/components/ad-detail/ad-detail.component.ts` | Extract to shared component | Pending |
| Form Validation Logic | Multiple form components | Extract to shared form validation service | Pending |
| Image Gallery | Multiple components | Use shared image gallery component | Pending |

### Service Duplications

| Duplicated Code | Locations | Refactoring Strategy | Status |
|-----------------|-----------|----------------------|--------|
| HTTP Error Handling | Multiple services | Extract to HTTP interceptor | Pending |
| Local Storage Access | Multiple services | Create shared storage service | Pending |
| Date Formatting | Multiple components and services | Create shared date utility | Pending |

### Utility Duplications

| Duplicated Code | Locations | Refactoring Strategy | Status |
|-----------------|-----------|----------------------|--------|
| String Formatting | Multiple files | Create shared string utility | Pending |
| Validation Functions | Multiple files | Create shared validation utility | Pending |
| URL Manipulation | Multiple files | Create shared URL utility | Pending |

## Server-side Duplications

### Controller Duplications

| Duplicated Code | Locations | Refactoring Strategy | Status |
|-----------------|-----------|----------------------|--------|
| Error Response Formatting | Multiple controllers | Extract to utility function | Pending |
| Pagination Logic | Multiple controllers | Extract to middleware or utility | Pending |
| Query Building | Multiple controllers | Extract to utility function | Pending |

### Middleware Duplications

| Duplicated Code | Locations | Refactoring Strategy | Status |
|-----------------|-----------|----------------------|--------|
| Request Validation | Multiple middleware files | Create shared validation middleware | Pending |
| Response Formatting | Multiple middleware files | Create shared response formatter | Pending |
| Error Handling | Multiple middleware files | Create shared error handler | Pending |

### Model Duplications

| Duplicated Code | Locations | Refactoring Strategy | Status |
|-----------------|-----------|----------------------|--------|
| Timestamp Fields | Multiple models | Create shared schema plugin | Pending |
| Validation Logic | Multiple models | Create shared validation functions | Pending |
| Index Definitions | Multiple models | Standardize index creation | Pending |

## Shared Duplications

| Duplicated Code | Locations | Refactoring Strategy | Status |
|-----------------|-----------|----------------------|--------|
| Configuration Loading | Client and server | Create shared configuration module | Pending |
| Environment Detection | Client and server | Create shared environment module | Pending |
| Logging | Client and server | Create shared logging module | Pending |

## Refactoring Strategies

When refactoring duplicated code, follow these guidelines:

1. **Extract to Component**: For duplicated UI elements, extract to a shared component with appropriate inputs and outputs.

2. **Extract to Service**: For duplicated business logic, extract to a shared service.

3. **Extract to Utility**: For duplicated helper functions, extract to a utility class or function.

4. **Extract to Middleware**: For duplicated request/response handling, extract to middleware.

5. **Extract to Model Plugin**: For duplicated model logic, extract to a model plugin or mixin.

## Reporting Duplicated Code

If you find duplicated code that is not listed in this document, please report it by:

1. Adding an entry to this document
2. Creating an issue in the project's issue tracker

## Duplication Detection

We use the following tools to detect code duplication:

- ESLint with `eslint-plugin-sonarjs` for JavaScript/TypeScript
- SonarQube for comprehensive code analysis
- Manual code reviews

Run duplication detection regularly to keep this document up to date.