const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { 
    message: 'Too many requests from this IP, please try again after 15 minutes' 
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 10,
  message: { 
    message: 'Too many authentication attempts, please try again after 5 minutes' 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
};
