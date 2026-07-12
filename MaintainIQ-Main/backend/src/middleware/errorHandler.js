const { errorResponse } = require('../utils/apiResponse');

// 404 Route handler
const notFoundHandler = (req, res, next) => {
  res.status(404).json(
    errorResponse(`Path not found: ${req.originalUrl}`)
  );
};

// Global Central Error Interceptor
const globalErrorHandler = (err, req, res, next) => {
  console.error('[Global Error Interceptor]', err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';
  let errors = [];

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Database validation failed';
    errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message
    }));
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with ID of: ${err.value}`;
    errors = [{ field: err.path, message: 'Invalid ID format' }];
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
    const fieldName = Object.keys(err.keyValue)[0];
    errors = [{ field: fieldName, message: `The ${fieldName} is already taken or registered` }];
  }

  // Multer errors (e.g., file too large)
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size is too large. Max limit is 10MB.';
    errors = [{ field: 'file', message: 'Size exceeds threshold limit' }];
  }

  res.status(statusCode).json(
    errorResponse(message, errors)
  );
};

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
