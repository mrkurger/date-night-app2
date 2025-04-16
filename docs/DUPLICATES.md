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

| Duplicated Code       | Locations                                                                                                                                                           | Refactoring Strategy                      | Status  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------- |
| Ad Card Rendering     | `client-angular/src/app/features/ads/components/ad-list/ad-list.component.ts` and `client-angular/src/app/features/ads/components/ad-detail/ad-detail.component.ts` | Extract to shared component               | Pending |
| Form Validation Logic | Multiple form components                                                                                                                                            | Extract to shared form validation service | Pending |
| Image Gallery         | Multiple components                                                                                                                                                 | Use shared image gallery component        | Pending |
| Review Display        | Multiple components                                                                                                                                                 | Extract to shared review components       | Pending |

### Service Duplications

| Duplicated Code                 | Locations                                                                                                                              | Refactoring Strategy                | Status                                                                                    |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------- |
| HTTP Error Handling             | Multiple services                                                                                                                      | Extract to HTTP interceptor         | Completed - See [Error Handling and Telemetry Documentation](./ErrorHandlingTelemetry.md) |
| Safety Controller Methods       | `server/controllers/safety.controller.js`                                                                                              | Extract to shared utility functions | Pending                                                                                   |
| Verification Controller Methods | `server/controllers/verification.controller.js`                                                                                        | Extract to shared utility functions | Pending                                                                                   |
| Local Storage Access            | Multiple services                                                                                                                      | Create shared storage service       | Pending                                                                                   |
| Date Formatting                 | Multiple components and services                                                                                                       | Create shared date utility          | Completed                                                                                 |
| Batch Operation Patterns        | `server/controllers/favorite.controller.js` and `client-angular/src/app/features/favorites/favorites-page/favorites-page.component.ts` | Extract to shared utility functions | In Progress - Identified additional duplication in client-side batch operations           |

### Utility Duplications

| Duplicated Code      | Locations      | Refactoring Strategy             | Status  |
| -------------------- | -------------- | -------------------------------- | ------- |
| String Formatting    | Multiple files | Create shared string utility     | Pending |
| Validation Functions | Multiple files | Create shared validation utility | Pending |
| URL Manipulation     | Multiple files | Create shared URL utility        | Pending |

## Server-side Duplications

### Controller Duplications

| Duplicated Code           | Locations            | Refactoring Strategy             | Status  |
| ------------------------- | -------------------- | -------------------------------- | ------- |
| Error Response Formatting | Multiple controllers | Extract to utility function      | Pending |
| Pagination Logic          | Multiple controllers | Extract to middleware or utility | Pending |
| Query Building            | Multiple controllers | Extract to utility function      | Pending |

### Middleware Duplications

| Duplicated Code     | Locations                 | Refactoring Strategy                | Status  |
| ------------------- | ------------------------- | ----------------------------------- | ------- |
| Request Validation  | Multiple middleware files | Create shared validation middleware | Pending |
| Response Formatting | Multiple middleware files | Create shared response formatter    | Pending |
| Error Handling      | Multiple middleware files | Create shared error handler         | Pending |

### Model Duplications

| Duplicated Code   | Locations       | Refactoring Strategy               | Status  |
| ----------------- | --------------- | ---------------------------------- | ------- |
| Timestamp Fields  | Multiple models | Create shared schema plugin        | Pending |
| Validation Logic  | Multiple models | Create shared validation functions | Pending |
| Index Definitions | Multiple models | Standardize index creation         | Pending |

## Shared Duplications

| Duplicated Code       | Locations                                                                                 | Refactoring Strategy                  | Status  |
| --------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------- | ------- |
| Configuration Loading | Client and server                                                                         | Create shared configuration module    | Pending |
| Rate Limiter Logic    | `server/middleware/rateLimiter.js`                                                        | Refactor to use configuration objects | Pending |
| Environment Detection | Client and server                                                                         | Create shared environment module      | Pending |
| Logging               | Client and server                                                                         | Create shared logging module          | Pending |
| Payment Method Schema | `server/models/paymentMethod.model.js` and `server/models/wallet.model.js`                | Extract to shared schema              | Pending |
| Location Schema       | `server/data/norway-locations.js` and `server/models/ad.model.js`                         | Extract to shared schema              | Pending |
| User Schema           | `server/components/SCHEMA_REFACTOR_NEEDED.js` and `server/components/users/user.model.js` | Consolidate schemas                   | Pending |

### Test Duplications

| Duplicated Code      | Locations                                              | Refactoring Strategy    | Status  |
| -------------------- | ------------------------------------------------------ | ----------------------- | ------- |
| Payment Method Tests | `server/tests/unit/models/paymentMethod.model.test.js` | Extract to test helpers | Pending |
| Ad Model Tests       | `server/tests/unit/models/ad.model.test.js`            | Extract to test helpers | Pending |

## Refactoring Strategies

When refactoring duplicated code, follow these guidelines:

1. **Extract to Component**: For duplicated UI elements, extract to a shared component with appropriate inputs and outputs.

   - Example: Extract the duplicated Netflix/Tinder component logic to a shared `MediaBrowsingComponent`

2. **Extract to Service**: For duplicated business logic, extract to a shared service.

   - Example: Extract wallet transaction logic to a `TransactionService`

3. **Extract to Utility**: For duplicated helper functions, extract to a utility class or function.

   - Example: Create a `ValidationUtils` class for shared validation functions

4. **Extract to Middleware**: For duplicated request/response handling, extract to middleware.

   - Example: Create a unified rate limiter middleware with configuration options

5. **Extract to Model Plugin**: For duplicated model logic, extract to a model plugin or mixin.

   - Example: Create a shared schema plugin for payment methods

6. **Extract to Shared Schema**: For duplicated database schemas, extract to a shared schema definition.

   - Example: Create a shared location schema used by both ads and location data

7. **Extract to Test Helpers**: For duplicated test code, extract to test helper functions.

   - Example: Create test fixtures and assertion helpers for model tests

8. **Use Parameterization**: For similar code with minor variations, parameterize the differences.

   - Example: Refactor skeleton loader templates to use loops with configuration parameters

9. **Use CSS Variables and Mixins**: For duplicated styles, use CSS variables and mixins.

   - Example: Consolidate design tokens into a single source of truth with variables

10. **Template Partials**: For duplicated HTML/template code, extract to partial templates.
    - Example: Extract common dialog templates to reusable partial templates

## Reporting Duplicated Code

If you find duplicated code that is not listed in this document, please report it by:

1. Adding an entry to this document
2. Creating an issue in the project's issue tracker

## Duplication Detection

We use the following tools to detect code duplication:

- jscpd (JavaScript Copy-Paste Detector) for detailed duplication analysis
- Manual code reviews
- SonarQube for comprehensive code analysis (if available)

> **Note:** While ESLint with `eslint-plugin-sonarjs` is mentioned in some documentation, our testing has shown that jscpd is more effective for detecting code duplications in this project. The SonarJS plugin is better suited for detecting other code quality issues rather than comprehensive duplication detection.

### Running jscpd

To detect duplications in the client-side code:

```bash
# For client-side code
find /Users/oivindlund/date-night-app/client-angular/src -type f \( -name "*.ts" -o -name "*.html" -o -name "*.scss" -o -name "*.css" \) -not -path "*/node_modules/*" | xargs jscpd --min-lines 10 --min-tokens 100 --output /Users/oivindlund/date-night-app/duplication-report
```

To detect duplications in the server-side code:

```bash
# For server-side code
find /Users/oivindlund/date-night-app/server -type f -name "*.js" -not -path "*/node_modules/*" | xargs jscpd --min-lines 10 --min-tokens 100 --output /Users/oivindlund/date-night-app/duplication-report
```

Run duplication detection regularly to keep this document up to date. Update the paths in the commands above to match your local environment.

## Duplication Cleanup Plan

To systematically clean up the duplicated code identified in this document, we have developed a comprehensive phased approach based on detailed analysis of the codebase.

### Phase 1: Assessment and Prioritization (Week 1) - COMPLETED

We have completed a thorough assessment of code duplication in the codebase, with the following key findings:

1. **Verified Duplications**: We manually reviewed and confirmed all duplications listed in this document.
2. **Impact Analysis**: We assessed each duplication based on its impact on maintainability, performance, and developer productivity.
3. **Prioritization Matrix**: We created a prioritization matrix ranking duplications based on:
   - Frequency of duplication
   - Complexity of the duplicated code
   - Risk level of refactoring
   - Potential maintenance benefits

The detailed findings from Phase 1 are available in the `/phase1-assessment` directory, including:

- Detailed analysis of specific duplications
- Prioritization matrix with scores for each duplication
- Risk assessment for each refactoring
- Implementation plans for subsequent phases

### Phase 2: Low-Risk Refactorings (Weeks 2-3)

1. **Utility Functions**: Extract duplicated utility functions

   - String formatting utilities
   - Date formatting utilities
   - Validation functions
   - URL manipulation utilities

2. **CSS/SCSS Refactoring**: Consolidate duplicated styles

   - Extract shared mixins
   - Consolidate design tokens
   - Create reusable animation definitions

3. **Test Helpers**: Create shared test utilities

   - Test fixtures
   - Common assertions
   - Mock data generators

4. **Shared HTTP Error Handling**: Implement centralized error handling
   - Create HTTP interceptor for client-side error handling
   - Standardize error response format
   - Implement consistent logging

### Phase 3: Medium-Risk Refactorings (Weeks 4-5)

1. **Shared Media Browsing Component**: Extract duplicated Netflix/Tinder logic

   - Create base component for common functionality
   - Extract shared templates
   - Maintain view-specific customizations

2. **Shared Form Components**: Create reusable form elements

   - Extract common form controls
   - Implement shared validation service
   - Create consistent form templates

3. **Shared Storage Service**: Unify local storage access

   - Create service for storage operations
   - Support different storage types
   - Implement serialization/deserialization

4. **Shared Schema Plugins**: Extract common Mongoose schema logic

   - Create timestamp plugin
   - Implement validation plugin
   - Create index plugin

5. **Payment Method Schema**: Extract duplicated schema
   - Create shared schema definition
   - Update models to use shared schema
   - Ensure backward compatibility

### Phase 4: High-Risk Refactorings (Weeks 6-7)

1. **Base Controller Class**: Unify controller logic

   - Create base controller with common CRUD operations
   - Implement standard error handling
   - Extract pagination and query building

2. **Unified Middleware**: Consolidate middleware

   - Create configurable rate limiter
   - Implement shared validation middleware
   - Create unified error handler

3. **Shared Location Schema**: Extract location data structure

   - Create shared schema definition
   - Update models to use shared schema
   - Ensure data consistency

4. **User Schema Consolidation**: Unify user data model

   - Analyze existing schemas
   - Create consolidated schema
   - Implement migration strategy

5. **Complex Component Refactoring**: Address advanced UI duplications
   - Create shared media browsing component
   - Implement shared payment dialog
   - Extract card component hierarchy

### Phase 5: Testing and Validation (Week 8)

1. **Comprehensive Testing**: Ensure all refactored code works correctly

   - Unit tests for all new shared components/services
   - Integration tests for refactored workflows
   - End-to-end tests for critical user journeys

2. **Performance Testing**: Verify refactoring hasn't impacted performance

   - Load testing
   - Memory profiling
   - Rendering performance

3. **Documentation**: Update documentation to reflect the new architecture

   - Update component documentation
   - Document shared utilities and services
   - Create usage examples for shared components

4. **Code Quality Analysis**: Verify improvement
   - Run static code analysis
   - Measure duplication reduction
   - Analyze complexity metrics

### Risk Mitigation Strategies

1. **Feature Toggles**: Use feature toggles to gradually roll out refactored code
2. **Parallel Implementations**: Keep old implementations alongside new ones initially
3. **Incremental Refactoring**: Refactor in small, testable increments
4. **Comprehensive Testing**: Write tests before refactoring
5. **Code Reviews**: Require thorough code reviews for all refactorings
6. **Monitoring**: Add monitoring to detect issues early
7. **Database Backups**: Create backups before schema migrations
8. **Rollback Plan**: Prepare detailed rollback procedures for each change

By following this phased approach, we can systematically eliminate code duplication while minimizing the risk of introducing bugs or regressions. The detailed implementation plans for each phase are available in the `/phase1-assessment` directory.
