# Authentication System

## Overview

The Authentication System is a core feature of DateNight.io that provides secure user authentication, authorization, and account management capabilities. It supports multiple authentication methods, role-based access control, and secure session management.

## User Experience

Users interact with the Authentication System through several interfaces:

- **Registration**: New users can create an account with email/password or social login
- **Login**: Existing users can authenticate using email/password or social login
- **Password Recovery**: Users can reset their password via email
- **Profile Management**: Users can update their profile information and credentials
- **Session Management**: Users can view active sessions and log out from specific devices
- **Account Verification**: New users receive email verification to confirm their account

## Architecture

### Client-Side Components

| Component                 | Path                                                                                   | Description                     |
| ------------------------- | -------------------------------------------------------------------------------------- | ------------------------------- |
| `AuthModule`              | `/client-angular/src/app/auth/auth.module.ts`                                          | Main module for auth feature    |
| `LoginComponent`          | `/client-angular/src/app/auth/components/login/login.component.ts`                     | Handles user login              |
| `RegisterComponent`       | `/client-angular/src/app/auth/components/register/register.component.ts`               | Handles user registration       |
| `ForgotPasswordComponent` | `/client-angular/src/app/auth/components/forgot-password/forgot-password.component.ts` | Handles password reset requests |
| `ResetPasswordComponent`  | `/client-angular/src/app/auth/components/reset-password/reset-password.component.ts`   | Handles password reset          |
| `VerifyEmailComponent`    | `/client-angular/src/app/auth/components/verify-email/verify-email.component.ts`       | Handles email verification      |
| `ProfileComponent`        | `/client-angular/src/app/auth/components/profile/profile.component.ts`                 | Displays and edits user profile |
| `SessionsComponent`       | `/client-angular/src/app/auth/components/sessions/sessions.component.ts`               | Manages active user sessions    |
| `AuthCallbackComponent`   | `/client-angular/src/app/auth/components/auth-callback/auth-callback.component.ts`     | Handles OAuth callback          |

### Client-Side Services

| Service           | Path                                                            | Description                              |
| ----------------- | --------------------------------------------------------------- | ---------------------------------------- |
| `AuthService`     | `/client-angular/src/app/core/services/auth.service.ts`         | Handles authentication operations        |
| `TokenService`    | `/client-angular/src/app/core/services/token.service.ts`        | Manages JWT tokens                       |
| `UserService`     | `/client-angular/src/app/core/services/user.service.ts`         | Manages user data                        |
| `AuthGuard`       | `/client-angular/src/app/core/guards/auth.guard.ts`             | Protects routes requiring authentication |
| `RoleGuard`       | `/client-angular/src/app/core/guards/role.guard.ts`             | Protects routes requiring specific roles |
| `AuthInterceptor` | `/client-angular/src/app/core/interceptors/auth.interceptor.ts` | Adds auth token to HTTP requests         |

### Server-Side Controllers

| Controller          | Path                                               | Description                     |
| ------------------- | -------------------------------------------------- | ------------------------------- |
| `AuthController`    | `/server/components/auth/auth.controller.js`       | Handles authentication requests |
| `UserController`    | `/server/components/user/user.controller.js`       | Handles user-related requests   |
| `SessionController` | `/server/components/session/session.controller.js` | Manages user sessions           |

### Server-Side Services

| Service        | Path                                | Description                              |
| -------------- | ----------------------------------- | ---------------------------------------- |
| `AuthService`  | `/server/services/auth.service.js`  | Implements authentication business logic |
| `TokenService` | `/server/services/token.service.js` | Generates and validates JWT tokens       |
| `EmailService` | `/server/services/email.service.js` | Sends verification and reset emails      |
| `UserService`  | `/server/services/user.service.js`  | Manages user data                        |

### Models

| Model     | Path                                          | Description                             |
| --------- | --------------------------------------------- | --------------------------------------- |
| `User`    | `/server/components/user/user.model.js`       | Mongoose schema for users               |
| `Session` | `/server/components/session/session.model.js` | Mongoose schema for user sessions       |
| `Token`   | `/server/components/token/token.model.js`     | Mongoose schema for verification tokens |

## API Endpoints

| Endpoint                              | Method | Description                  | Request Body                     | Response                 |
| ------------------------------------- | ------ | ---------------------------- | -------------------------------- | ------------------------ |
| `/api/auth/register`                  | POST   | Register a new user          | `{email, password, name}`        | User object with token   |
| `/api/auth/login`                     | POST   | Authenticate a user          | `{email, password}`              | User object with token   |
| `/api/auth/logout`                    | POST   | Log out a user               | `{sessionId?}`                   | Success message          |
| `/api/auth/refresh-token`             | POST   | Refresh an expired JWT token | `{refreshToken}`                 | New access token         |
| `/api/auth/forgot-password`           | POST   | Request password reset       | `{email}`                        | Success message          |
| `/api/auth/reset-password`            | POST   | Reset password with token    | `{token, newPassword}`           | Success message          |
| `/api/auth/verify-email`              | GET    | Verify email address         | Query param: `token`             | Success message          |
| `/api/auth/resend-verification`       | POST   | Resend verification email    | `{email}`                        | Success message          |
| `/api/auth/social/:provider`          | GET    | Initiate social login        | N/A                              | Redirect to provider     |
| `/api/auth/social/callback/:provider` | GET    | Handle social login callback | Query params from provider       | Redirect with token      |
| `/api/users/me`                       | GET    | Get current user profile     | N/A                              | User object              |
| `/api/users/me`                       | PUT    | Update user profile          | User object                      | Updated user object      |
| `/api/users/me/password`              | PUT    | Change password              | `{currentPassword, newPassword}` | Success message          |
| `/api/users/me/sessions`              | GET    | Get active sessions          | N/A                              | Array of session objects |
| `/api/users/me/sessions/:id`          | DELETE | Terminate a specific session | N/A                              | Success message          |

## Data Flow

The authentication system follows these data flows:

1. **Registration Flow**:

   - User submits registration data through RegisterComponent
   - AuthService sends a POST request to `/api/auth/register`
   - AuthController validates the request and calls AuthService.register()
   - User is created in the database with a hashed password
   - Verification email is sent to the user
   - JWT token is generated and returned to the client
   - User is redirected to the verification pending page

2. **Login Flow**:

   - User submits credentials through LoginComponent
   - AuthService sends a POST request to `/api/auth/login`
   - AuthController validates credentials and calls AuthService.login()
   - If valid, a JWT token and refresh token are generated
   - Session is created in the database
   - Tokens and user data are returned to the client
   - TokenService stores tokens in localStorage/cookies
   - User is redirected to the dashboard

3. **Password Reset Flow**:

   - User requests password reset through ForgotPasswordComponent
   - AuthService sends a POST request to `/api/auth/forgot-password`
   - AuthController generates a reset token and calls EmailService
   - Reset email with token link is sent to the user
   - User clicks the link and is directed to ResetPasswordComponent
   - User submits new password
   - AuthService sends a POST request to `/api/auth/reset-password`
   - AuthController validates the token and updates the password
   - User is redirected to login

4. **Social Authentication Flow**:
   - User clicks social login button
   - AuthService redirects to `/api/auth/social/:provider`
   - AuthController redirects to the provider's OAuth page
   - User authenticates with the provider
   - Provider redirects back to `/api/auth/social/callback/:provider`
   - AuthController processes the OAuth response
   - If the user exists, they are logged in; otherwise, a new account is created
   - JWT token is generated and returned via redirect
   - AuthCallbackComponent processes the token
   - User is redirected to the dashboard

## State Management

The authentication system uses a combination of service-based state management and local storage:

- **AuthService**: Maintains the current authentication state
- **TokenService**: Manages JWT tokens in localStorage/cookies
- **AuthGuard/RoleGuard**: Enforce access control based on auth state
- **AuthInterceptor**: Automatically adds tokens to API requests

## Key Algorithms and Logic

1. **Password Hashing**:

   - Passwords are hashed using bcrypt with a salt factor of 10
   - Passwords are never stored in plain text
   - Password comparison is done using bcrypt.compare()

2. **JWT Token Generation**:

   - Access tokens are signed with a secret key and expire after 15 minutes
   - Refresh tokens are signed with a different secret key and expire after 7 days
   - Tokens include user ID, roles, and permissions

3. **Role-Based Access Control**:

   - Users have one or more roles (user, admin, moderator)
   - Routes are protected based on required roles
   - UI elements are conditionally rendered based on user permissions

4. **Session Management**:
   - Each login creates a new session record
   - Sessions include device info, IP address, and last activity
   - Users can view and terminate specific sessions
   - Sessions expire after 30 days of inactivity

## Security Considerations

1. **Token Security**:

   - Access tokens are short-lived (15 minutes)
   - Refresh tokens are stored in HTTP-only cookies
   - CSRF protection is implemented for token endpoints
   - Tokens are invalidated on logout

2. **Account Protection**:

   - Rate limiting is applied to login attempts
   - Account lockout after multiple failed attempts
   - Email verification is required for new accounts
   - Password strength requirements are enforced

3. **Data Protection**:
   - Sensitive data is encrypted in the database
   - PII is minimized and properly secured
   - HTTPS is required for all authentication endpoints
   - Security headers are implemented (CSP, HSTS, etc.)

## Testing

### Unit Tests

| Test File                    | Path                                                                          | Description                  |
| ---------------------------- | ----------------------------------------------------------------------------- | ---------------------------- |
| `auth.service.spec.ts`       | `/client-angular/src/app/core/services/auth.service.spec.ts`                  | Tests for auth service       |
| `login.component.spec.ts`    | `/client-angular/src/app/auth/components/login/login.component.spec.ts`       | Tests for login component    |
| `register.component.spec.ts` | `/client-angular/src/app/auth/components/register/register.component.spec.ts` | Tests for register component |
| `auth.guard.spec.ts`         | `/client-angular/src/app/core/guards/auth.guard.spec.ts`                      | Tests for auth guard         |

### Integration Tests

| Test File                 | Path                                                     | Description               |
| ------------------------- | -------------------------------------------------------- | ------------------------- |
| `auth.controller.test.js` | `/server/tests/integration/auth/auth.controller.test.js` | API integration tests     |
| `auth.service.test.js`    | `/server/tests/integration/auth/auth.service.test.js`    | Service integration tests |

## Configuration Options

The authentication system supports several configuration options:

- **JWT_SECRET**: Secret key for signing JWT tokens
- **JWT_REFRESH_SECRET**: Secret key for signing refresh tokens
- **JWT_EXPIRATION**: Expiration time for access tokens (default: 15m)
- **JWT_REFRESH_EXPIRATION**: Expiration time for refresh tokens (default: 7d)
- **PASSWORD_SALT_ROUNDS**: Number of bcrypt salt rounds (default: 10)
- **EMAIL_VERIFICATION_REQUIRED**: Whether email verification is required (default: true)
- **ACCOUNT_LOCKOUT_THRESHOLD**: Number of failed attempts before lockout (default: 5)
- **ACCOUNT_LOCKOUT_DURATION**: Duration of account lockout (default: 15m)
- **SESSION_EXPIRATION**: Expiration time for sessions (default: 30d)

## Known Limitations

1. **Social Authentication**:

   - Limited to Google, Facebook, and Twitter
   - Profile data synchronization may be incomplete
   - Social account linking is not yet implemented

2. **Multi-Factor Authentication**:

   - Currently limited to email verification
   - TOTP/SMS-based 2FA is planned but not implemented

3. **Session Management**:
   - Limited device fingerprinting
   - No real-time session monitoring
   - Session transfer between devices is not supported

## Future Enhancements

1. **Advanced Authentication**:

   - Implement TOTP-based 2FA
   - Add biometric authentication support
   - Implement WebAuthn/FIDO2 passwordless login

2. **Enhanced Security**:

   - Add anomaly detection for login attempts
   - Implement risk-based authentication
   - Add IP-based geolocation verification

3. **User Management**:

   - Add self-service account deletion
   - Implement account recovery options
   - Add user impersonation for admins

4. **Compliance**:
   - Enhance GDPR compliance features
   - Add consent management
   - Implement comprehensive audit logging

## Related Documentation

- [SECURITY_BEST_PRACTICES.MD](/docs/SECURITY_BEST_PRACTICES.MD)
- [AUTHENTICATION_FLOW.MD](/docs/AUTHENTICATION_FLOW.MD)
- [DATA_PROTECTION.MD](/docs/DATA_PROTECTION.MD)
- [API_DOCUMENTATION.MD](/docs/API_DOCUMENTATION.MD)
