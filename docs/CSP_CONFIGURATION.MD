# Content Security Policy (CSP) Configuration

This document explains the Content Security Policy (CSP) configuration for the DateNight.io application.

## What is CSP?

Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks, including Cross-Site Scripting (XSS) and data injection attacks. These attacks are used for everything from data theft to site defacement to distribution of malware.

## CSP Configuration in DateNight.io

### Server-Side CSP

The server-side CSP is configured in `server/server.js` using the Helmet middleware. The configuration is different for development and production environments:

#### Development Environment

In development, we allow `unsafe-eval` and `unsafe-inline` to support Angular's development mode, which uses JIT (Just-In-Time) compilation:

```javascript
// Allow unsafe-eval in development mode for Angular
const isDevelopment = process.env.NODE_ENV === 'development';
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        (req, res) => `'nonce-${res.locals.cspNonce}'`,
        ...(isDevelopment ? ["'unsafe-eval'", "'unsafe-inline'"] : [])
      ],
      // Other directives...
    }
  }
}));
```

#### Production Environment

In production, we use a more restrictive CSP that doesn't allow `unsafe-eval` or `unsafe-inline` for scripts:

```javascript
scriptSrc: [
  "'self'",
  (req, res) => `'nonce-${res.locals.cspNonce}'`
]
```

### Client-Side CSP

The Angular client also has a CSP configuration in `client-angular/src/index.html`:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://*.googleapis.com; connect-src 'self' ws: wss: http://localhost:* ws://localhost:*; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'">
```

This configuration is automatically updated by the `csp-config.js` script when building or starting the application.

## Fixing CSP Issues

If you encounter CSP issues, you can use the provided script to fix them:

```bash
npm run fix-csp
```

This script will:
1. Update the server-side CSP configuration in `server/server.js`
2. Update the client-side CSP configuration in `client-angular/src/index.html`

To fix CSP issues and restart the application in one command:

```bash
npm run fix-csp:restart
```

## CSP Directives Explained

Here's an explanation of the CSP directives used in our configuration:

- **default-src 'self'**: Only allow resources from the same origin by default
- **script-src**: Controls which scripts can be executed
  - **'self'**: Scripts from the same origin
  - **'unsafe-eval'**: Allows the use of `eval()` and similar functions (development only)
  - **'unsafe-inline'**: Allows inline scripts (development only)
  - **nonce-{random}**: Allows scripts with a specific nonce attribute
- **style-src**: Controls which styles can be applied
  - **'self'**: Styles from the same origin
  - **'unsafe-inline'**: Allows inline styles (required for Angular)
  - **https://fonts.googleapis.com**: Allows loading styles from Google Fonts
- **font-src**: Controls where fonts can be loaded from
  - **'self'**: Fonts from the same origin
  - **https://fonts.gstatic.com**: Allows loading fonts from Google Fonts
- **img-src**: Controls where images can be loaded from
  - **'self'**: Images from the same origin
  - **data:**: Allows data: URIs for images
  - **blob:**: Allows blob: URIs for images
- **connect-src**: Controls which URLs can be loaded using script interfaces
  - **'self'**: Connections to the same origin
  - **ws:, wss:**: Allows WebSocket connections
  - **http://localhost:*, ws://localhost:***: Allows connections to localhost (development only)
- **object-src 'none'**: Prevents loading plugins like Flash
- **base-uri 'self'**: Restricts the URLs that can be used in a document's `<base>` element
- **form-action 'self'**: Restricts where forms can be submitted to
- **frame-ancestors 'self'**: Controls which sites can embed this site in an iframe

## Best Practices

1. **Use nonces for inline scripts**: Instead of using `unsafe-inline`, use nonces for any inline scripts that are required.
2. **Avoid eval()**: Restructure your code to avoid using `eval()` and similar functions.
3. **Use separate CSP for development and production**: Development environments often need more permissive CSP settings.
4. **Monitor CSP violations**: Set up reporting to track CSP violations in production.

## Troubleshooting

If you encounter CSP-related errors in the browser console, such as:

```
Content Security Policy of your site blocks the use of 'eval' in JavaScript
```

Run the fix-csp script:

```bash
npm run fix-csp
```

Then restart the application:

```bash
npm run dev
```

If you're still experiencing issues, you may need to modify the CSP configuration to allow specific resources required by your application.