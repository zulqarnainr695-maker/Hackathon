const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, updateUser, deleteUser } = require('../controllers/user.controller');
const { createUserValidator, updateUserValidator } = require('../validations/user.validation');
const validateRequest = require('../middleware/validation');
const { protect, authorize } = require('../middleware/auth');

// Secure all user management endpoints to Admin only
router.use(protect);
router.use(authorize('Admin'));

router.get('/', getAllUsers);
router.post('/', createUserValidator, validateRequest, createUser);
router.put('/:id', updateUserValidator, validateRequest, updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
