const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max) => rateLimit({
  windowMs,
  max,
  message: { error: 'Too many requests, please try again later.' }
});

module.exports = {
  // General API limiter
  apiLimiter: createLimiter(15 * 60 * 1000, 100),
  
  // Auth endpoints limiter
  authLimiter: createLimiter(60 * 60 * 1000, 5),
  
  // Chat message limiter
  chatLimiter: createLimiter(60 * 1000, 20)
};
