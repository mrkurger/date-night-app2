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

| Dependency                            | Replacement                          | Status  | Notes                                         |
| ------------------------------------- | ------------------------------------ | ------- | --------------------------------------------- |
| `inflight@1.0.6`                      | `lru-cache`                          | Removed | This module is not supported and leaks memory |
| `rimraf@3.0.2`                        | `rimraf@5.0.5`                       | Updated | Versions prior to v4 are no longer supported  |
| `abab@2.0.6`                          | Native `atob()` and `btoa()` methods | Removed | Use platform's native methods instead         |
| `glob@7.2.3`                          | `glob@10.3.10`                       | Updated | Versions prior to v9 are no longer supported  |
| `domexception@4.0.0`                  | Native `DOMException`                | Removed | Use platform's native DOMException            |
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
