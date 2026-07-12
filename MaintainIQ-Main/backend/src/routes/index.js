const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const assetRoutes = require('./asset.routes');
const issueRoutes = require('./issue.routes');
const maintenanceRoutes = require('./maintenance.routes');
const aiRoutes = require('./ai.routes');
const uploadRoutes = require('./upload.routes');
const dashboardRoutes = require('./dashboard.routes');

// Mount routes with namespace segmentation
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/assets', assetRoutes);
router.use('/issues', issueRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/ai', aiRoutes);
router.use('/uploads', uploadRoutes);
router.use('/dashboard', dashboardRoutes);

// --- COMPATIBILITY ROUTINGS ---
// Create direct aliases under `/api` for auth endpoints to match client expectations
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
