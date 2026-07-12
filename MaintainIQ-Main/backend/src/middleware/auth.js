const { verifyAccessToken } = require('../helpers/jwt.helper');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

// Authenticated user check
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json(errorResponse('Not authorized to access this route, token missing'));
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(401).json(errorResponse('Not authorized, token expired or invalid'));
  }

  try {
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json(errorResponse('User belonging to this token no longer exists'));
    }

    if (user.status === 'Inactive') {
      return res.status(403).json(errorResponse('User account is deactivated'));
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json(errorResponse('Internal server authentication error'));
  }
};

// Optional user check (does not reject request if token is missing or invalid)
const optionalProtect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return next();
  }

  try {
    const user = await User.findById(decoded.id).select('-password');
    if (user && user.status === 'Active') {
      req.user = user;
    }
  } catch (error) {
    // Fail silently in optional mode
  }
  next();
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(errorResponse('Not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(
        errorResponse(`User role '${req.user.role}' is not authorized to access this endpoint`)
      );
    }
    next();
  };
};

module.exports = {
  protect,
  optionalProtect,
  authorize
};
