const jwt = require('jsonwebtoken');

const signAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'jwt_access_secret',
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
};

const signRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || 'jwt_refresh_secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'jwt_access_secret');
  } catch (err) {
    return null;
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'jwt_refresh_secret');
  } catch (err) {
    return null;
  }
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
