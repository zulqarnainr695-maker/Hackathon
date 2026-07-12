const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get all users (e.g. for user list, assigning technicians)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { role, status } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (status) filter.status = status;

    const users = await User.find(filter).select('-password -refreshTokens');
    return res.status(200).json(successResponse('Users retrieved successfully', users));
  } catch (error) {
    next(error);
  }
};

// @desc    Create a user
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, status } = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json(errorResponse('An account with this email is already registered'));
    }

    // Dynamic avatar allocation
    const avatar = role === 'Admin'
      ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120'
      : 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=120';

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Technician',
      avatar,
      phone: phone || '',
      status: status || 'Active'
    });

    const userResponse = await User.findById(user._id).select('-password -refreshTokens');

    return res.status(201).json(successResponse('User created successfully', userResponse));
  } catch (error) {
    next(error);
  }
};

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, status } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }

    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json(errorResponse('Email address is already in use by another account'));
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (status) user.status = status;

    if (password) {
      user.password = password; // pre-save hook will hash this
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password -refreshTokens');

    return res.status(200).json(successResponse('User updated successfully', updatedUser));
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Prevent deleting self
    if (userId.toString() === req.user.id.toString()) {
      return res.status(400).json(errorResponse('You cannot delete your own administrative account'));
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }

    return res.status(200).json(successResponse('User deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
};
