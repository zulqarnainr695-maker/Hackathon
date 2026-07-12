const express = require('express');
const router = express.Router();
const { register, login, refresh, logout, me, updateMe } = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../validations/auth.validation');
const validateRequest = require('../middleware/validation');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, registerValidator, validateRequest, register);
router.post('/login', authLimiter, loginValidator, validateRequest, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, me);
router.put('/me', protect, updateMe);

module.exports = router;
