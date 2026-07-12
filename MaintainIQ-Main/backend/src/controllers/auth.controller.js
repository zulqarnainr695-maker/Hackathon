const User = require('../models/User');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helpers/jwt.helper');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Cookie options for secure HttpOnly cookie storage
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json(errorResponse('An account with this email is already registered'));
    }

    // Assign default aesthetic avatars based on chosen role
    const avatar = role === 'Admin'
      ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120'
      : 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=120';

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Technician',
      avatar,
      phone: phone || ''
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    // Save refresh token to user document
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Set refresh token as HTTP-Only cookie
    res.cookie('refreshToken', refreshToken, getCookieOptions());

    return res.status(201).json(
      successResponse('User registered successfully', {
        token: accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone
        }
      })
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json(errorResponse('Invalid email or password'));
    }

    if (user.status === 'Inactive') {
      return res.status(403).json(errorResponse('This account is currently deactivated'));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json(errorResponse('Invalid email or password'));
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    // Save refresh token in user document
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Set cookie
    res.cookie('refreshToken', refreshToken, getCookieOptions());

    return res.status(200).json(
      successResponse('User logged in successfully', {
        token: accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone
        }
      })
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh
// @access  Public
const refresh = async (req, res, next) => {
  try {
    const tokenFromCookie = req.cookies.refreshToken;
    const tokenFromBody = req.body.refreshToken;
    const refreshToken = tokenFromCookie || tokenFromBody;

    if (!refreshToken) {
      return res.status(401).json(errorResponse('Refresh token is required'));
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json(errorResponse('Invalid or expired refresh token'));
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json(errorResponse('Token is not active or user not found'));
    }

    // Generate new access token
    const newAccessToken = signAccessToken(user);

    return res.status(200).json(
      successResponse('Token refreshed successfully', {
        token: newAccessToken
      })
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Logout User
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res, next) => {
  try {
    const tokenFromCookie = req.cookies.refreshToken;
    const tokenFromBody = req.body.refreshToken;
    const refreshToken = tokenFromCookie || tokenFromBody;

    if (refreshToken) {
      const decoded = verifyRefreshToken(refreshToken);
      if (decoded) {
        // Remove refresh token from user list
        await User.findByIdAndUpdate(decoded.id, {
          $pull: { refreshTokens: refreshToken }
        });
      }
    }

    // Clear client cookies
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return res.status(200).json(successResponse('Logged out successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
// @access  Private
const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshTokens');
    return res.status(200).json(successResponse('User profile retrieved successfully', user));
  } catch (error) {
    next(error);
  }
};

// @desc    Update Current User Profile (Self)
// @route   PUT /api/auth/me
// @access  Private
const updateMe = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }

    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json(errorResponse('Email address is already in use'));
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password -refreshTokens');
    return res.status(200).json(successResponse('Profile details updated successfully', updatedUser));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
  updateMe
};
