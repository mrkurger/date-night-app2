const csrf = require('csurf');
const cookieParser = require('cookie-parser');

// Configure CSRF protection
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Middleware to handle CSRF errors
const handleCsrfError = (err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') {
    return next(err);
  }

  // Handle CSRF token errors
  res.status(403).json({
    success: false,
    message: 'Invalid or missing CSRF token. Please refresh the page and try again.'
  });
};

// Middleware to send CSRF token to client
const sendCsrfToken = (req, res, next) => {
  res.cookie('XSRF-TOKEN', req.csrfToken(), {
    httpOnly: false, // Client-side JavaScript needs to read this
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  next();
};

module.exports = {
  csrfProtection,
  handleCsrfError,
  sendCsrfToken,
  csrfMiddleware: [cookieParser(), csrfProtection, handleCsrfError, sendCsrfToken]
};