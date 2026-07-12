const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/apiResponse');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    
    return res.status(400).json(
      errorResponse('Validation failed', formattedErrors)
    );
  }
  next();
};

module.exports = validateRequest;
