const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/apiResponse');

// Custom handler for returning formatted errors on rate limit breach
const rateLimitHandler = (message) => {
  return (req, res, next, options) => {
    res.status(429).json(
      errorResponse(message, [
        { field: 'rate-limit', message: 'Too many requests, please try again later.' }
      ])
    );
  };
};

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  handler: rateLimitHandler('Too many requests from this IP, please try again in 15 minutes')
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 authentication attempts per windowMs
  handler: rateLimitHandler('Too many authentication attempts. Please try again in 15 minutes')
});

const aiTriageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 diagnostic requests per minute
  handler: rateLimitHandler('AI triage frequency limit exceeded. Please wait a minute before retrying.')
});

module.exports = {
  generalLimiter,
  authLimiter,
  aiTriageLimiter
};
