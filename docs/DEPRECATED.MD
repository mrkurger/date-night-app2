# Deprecated Code

This document lists deprecated code in the Date Night App project. Deprecated code should be avoided in new development and eventually removed from the codebase.

## Table of Contents

- [Client-side Deprecated Code](#client-side-deprecated-code)
  - [AngularJS Components](#angularjs-components)
  - [Legacy Services](#legacy-services)
  - [Deprecated UI Components](#deprecated-ui-components)
- [Server-side Deprecated Code](#server-side-deprecated-code)
  - [Legacy API Endpoints](#legacy-api-endpoints)
  - [Deprecated Middleware](#deprecated-middleware)
  - [Deprecated Models](#deprecated-models)
- [Deprecated Configuration](#deprecated-configuration)

## Client-side Deprecated Code

### AngularJS Components

The following AngularJS components have been replaced by Angular components and should not be used:

| Component                         | Replacement                                                | Removal Timeline |
| --------------------------------- | ---------------------------------------------------------- | ---------------- |
| `client/app/components/ad-list`   | `client-angular/src/app/features/ads/components/ad-list`   | Q3 2024          |
| `client/app/components/ad-detail` | `client-angular/src/app/features/ads/components/ad-detail` | Q3 2024          |
| `client/app/components/login`     | `client-angular/src/app/features/auth/login`               | Q3 2024          |
| `client/app/components/register`  | `client-angular/src/app/features/auth/register`            | Q3 2024          |

### Legacy Services

The following services have been replaced and should not be used:

| Service                               | Replacement                                            | Removal Timeline |
| ------------------------------------- | ------------------------------------------------------ | ---------------- |
| `client/app/services/auth.service.js` | `client-angular/src/app/core/services/auth.service.ts` | Q3 2024          |
| `client/app/services/ad.service.js`   | `client-angular/src/app/core/services/ad.service.ts`   | Q3 2024          |
| `client/app/services/chat.service.js` | `client-angular/src/app/core/services/chat.service.ts` | Q3 2024          |

### Deprecated UI Components

The following UI components have been replaced by Emerald components and should not be used:

| Component                       | Replacement                                         | Removal Timeline |
| ------------------------------- | --------------------------------------------------- | ---------------- |
| `client/app/shared/card`        | `client-angular/src/app/shared/emerald/app-card`    | Q3 2024          |
| `client/app/shared/grid`        | `client-angular/src/app/shared/emerald/card-grid`   | Q3 2024          |
| `client/app/shared/tinder-card` | `client-angular/src/app/shared/emerald/tinder-card` | Q3 2024          |

## Server-side Deprecated Code

### Legacy API Endpoints

The following API endpoints have been replaced and should not be used:

| Endpoint     | Replacement     | Removal Timeline |
| ------------ | --------------- | ---------------- |
| `/api/ads`   | `/api/v1/ads`   | Q3 2024          |
| `/api/users` | `/api/v1/users` | Q3 2024          |
| `/api/auth`  | `/api/v1/auth`  | Q3 2024          |

### Deprecated Middleware

The following middleware components have been replaced and should not be used:

| Middleware                        | Replacement                   | Removal Timeline |
| --------------------------------- | ----------------------------- | ---------------- |
| `server/middleware/old-auth.js`   | `server/middleware/auth.js`   | Q3 2024          |
| `server/middleware/old-upload.js` | `server/middleware/upload.js` | Q3 2024          |

### Deprecated Models

The following models have been updated and the old versions should not be used:

| Model                             | Replacement                   | Removal Timeline |
| --------------------------------- | ----------------------------- | ---------------- |
| `server/models/old-user.model.js` | `server/models/user.model.js` | Q3 2024          |
| `server/models/old-ad.model.js`   | `server/models/ad.model.js`   | Q3 2024          |

## Deprecated Configuration

The following configuration files have been replaced and should not be used:

| Configuration                   | Replacement                 | Removal Timeline |
| ------------------------------- | --------------------------- | ---------------- |
| `server/config/old-database.js` | `server/config/database.js` | Q3 2024          |
| `server/config/old-passport.js` | `server/config/passport.js` | Q3 2024          |

## Deprecated Dependencies

The following npm dependencies have been deprecated and should be replaced:

### Direct Dependencies (Already Addressed)

| Dependency         | Replacement                       | Status  | Notes                                    |
| ----------------- | --------------------------------- | ------- | ---------------------------------------- |
| `passport-reddit` | Removed Reddit authentication     | Removed | OAuth provider no longer supported       |
| `xss-clean`       | `xss-filters` custom middleware   | Updated | Package no longer supported             |
| `node-fetch@3.x`  | `node-fetch@4.x`                 | Updated | Now uses native DOMException            |

### Transitive Dependencies (Waiting for Updates)

| Dependency         | Source Package   | Replacement                   | Status    | Timeline                        |
| ----------------- | --------------- | ----------------------------- | --------- | ------------------------------- |
| `inflight@1.0.6`  | Jest           | `lru-cache`                   | Pending   | Wait for Jest update           |
| `glob@7.x`        | Jest           | `glob@10.x`                   | Pending   | Wait for Jest update           |
| `lodash.get`      | swagger-jsdoc   | Optional chaining (`?.`)      | Pending   | Wait for swagger-jsdoc update  |
| `lodash.isequal`  | swagger-jsdoc   | `util.isDeepStrictEqual`     | Pending   | Wait for swagger-jsdoc update  |

Notes:
- Transitive dependencies are included by other packages we depend on
- They will be automatically resolved when those packages update their dependencies
- We're tracking updates to Jest and swagger-jsdoc to resolve these
| `xss-clean@0.1.4`                     | `xss-filters` and custom middleware             | Updated | Package no longer supported                                    |
| `@humanwhocodes/object-schema@2.0.3`  | `@eslint/object-schema@2.1.6`        | Updated | Use @eslint/object-schema instead             |
| `@humanwhocodes/config-array@0.11.14` | `@eslint/config-array@0.20.0`        | Updated | Use @eslint/config-array instead              |
| `eslint@8.56.0`                       | `eslint@9.24.0`                      | Updated | Version 8.56.0 is no longer supported         |

## Deprecation Process

When deprecating code:

1. Add a `@deprecated` tag with a reason and suggested alternative in the code comments
2. Add the deprecated code to this document
3. Create a migration plan for removing the deprecated code
4. Set a timeline for removal

Example deprecation comment:

```javascript
/**
 * @deprecated Since version 2.0.0. Use NewComponent instead.
 * This component will be removed in version 3.0.0.
 */
```

## Reporting Deprecated Code

If you find code that should be deprecated but is not listed in this document, please report it by:

1. Adding a comment with `@deprecated` tag in the code
2. Adding an entry to this document
3. Creating an issue in the project's issue tracker

## Dependency Management

For detailed information about dependency management, including deprecated dependencies and their replacements, see [DEPENDENCY_MANAGEMENT.MD](/docs/DEPENDENCY_MANAGEMENT.MD).

## Document History

- **2025-05-20**: Updated removal timelines and verified dependency information
- **2025-04-18**: Added deprecated dependencies section
- **2025-03-15**: Initial version of the deprecated code document
