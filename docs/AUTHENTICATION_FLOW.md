# Authentication Flow

This document describes the authentication flow in the DateNight.io application, including registration, login, session management, and security features.

## Table of Contents

- [Overview](#overview)
- [Registration Process](#registration-process)
- [Login Process](#login-process)
- [OAuth Integration](#oauth-integration)
- [Session Management](#session-management)
- [Password Management](#password-management)
- [Multi-factor Authentication](#multi-factor-authentication)
- [Security Considerations](#security-considerations)

## Overview

DateNight.io uses a token-based authentication system with JWT (JSON Web Tokens) for managing user sessions. The system supports both traditional email/password authentication and OAuth integration with multiple providers.

## Registration Process

### Email/Password Registration

1. User submits registration form with email, password, and required profile information
2. Server validates the input and checks for existing accounts
3. Password is hashed using Argon2id with appropriate parameters
4. Verification email is sent to the user's email address
5. User account is created in a pending state
6. User clicks the verification link in the email
7. Account is activated and user is redirected to the login page

### Security Measures

- Rate limiting on registration attempts
- CAPTCHA for preventing automated registrations
- Password strength requirements
- Email verification to prevent fake accounts
- Input validation and sanitization

## Login Process

### Standard Login

1. User submits login form with email and password
2. Server validates the credentials
3. If valid, server generates JWT access token and refresh token
4. Access token is returned to the client
5. Refresh token is stored in an HTTP-only, secure cookie
6. Client stores the access token in memory (not in localStorage)
7. Client includes the access token in the Authorization header for API requests

### Failed Login Handling

- Rate limiting after multiple failed attempts
- Account lockout after excessive failed attempts
- Notification to user about failed login attempts
- Generic error messages to prevent username enumeration

## OAuth Integration

### Supported Providers

- Google
- GitHub
- Reddit
- Apple

### OAuth Flow

1. User clicks on OAuth provider button
2. User is redirected to the provider's authentication page
3. User authorizes the application
4. Provider redirects back to the application with an authorization code
5. Server exchanges the code for an access token
6. Server verifies the token and retrieves user information
7. If the user exists, they are logged in
8. If the user doesn't exist, a new account is created
9. JWT tokens are generated and returned as in the standard login flow

## Session Management

### Token Structure

- **Access Token**: Short-lived JWT (15 minutes) containing user ID and roles
- **Refresh Token**: Longer-lived token (7 days) for obtaining new access tokens

### Token Refresh Flow

1. When the access token expires, the client makes a request to the refresh endpoint
2. Server validates the refresh token from the HTTP-only cookie
3. If valid, server generates a new access token and optionally rotates the refresh token
4. New tokens are returned to the client

### Session Termination

- User-initiated logout
- Automatic logout after inactivity
- Server-side session invalidation
- Refresh token rotation for security

## Password Management

### Password Storage

- Passwords are hashed using Argon2id
- Legacy passwords use bcrypt (for backward compatibility)
- No plaintext passwords are ever stored or logged

### Password Reset Flow

1. User requests a password reset
2. Server generates a time-limited reset token
3. Reset link is sent to the user's email
4. User clicks the link and enters a new password
5. Server validates the token and updates the password
6. All active sessions for the user are invalidated

### Password Change Flow

1. User provides current password and new password
2. Server validates the current password
3. New password is hashed and stored
4. User remains logged in, but other sessions are optionally invalidated

## Multi-factor Authentication

### Available Methods

- Time-based One-Time Password (TOTP)
- Email verification codes
- SMS verification codes (where available)

### MFA Flow

1. User enables MFA in account settings
2. User sets up their preferred MFA method
3. On subsequent logins, after password verification, MFA challenge is required
4. User provides the MFA code
5. Server validates the code
6. If valid, authentication proceeds as normal

### Recovery Options

- Backup codes generated when MFA is enabled
- Alternative verification methods
- Account recovery process requiring identity verification

## Security Considerations

### Token Security

- Access tokens are short-lived to minimize risk
- Refresh tokens are stored in HTTP-only, secure cookies
- CSRF protection for token endpoints
- Token validation includes signature and expiration checks

### Account Protection

- Rate limiting on authentication attempts
- Account lockout policies
- Suspicious activity detection
- Login notifications for new devices or locations

### Infrastructure Security

- TLS/SSL for all authentication traffic
- Secure headers (HSTS, X-Content-Type-Options, etc.)
- Regular security audits and penetration testing
- Monitoring and alerting for authentication anomalies
