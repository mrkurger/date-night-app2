/**
 * Middleware to add additional security headers
 * These headers provide extra protection against common web vulnerabilities
 */
const securityHeaders = (req, res, next) => {
  // Strict-Transport-Security
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Permissions-Policy (formerly Feature-Policy)
  // Restrict browser features
  res.setHeader('Permissions-Policy', 
    'camera=self, microphone=self, geolocation=self, payment=self'
  );
  
  // Referrer-Policy
  // Control how much referrer information is included with requests
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Cache-Control
  // Prevent caching of sensitive data
  if (req.path.includes('/api/v1/auth/') || req.path.includes('/api/v1/users/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }
  
  next();
};

module.exports = securityHeaders;