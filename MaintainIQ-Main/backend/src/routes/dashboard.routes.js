const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('Admin'), getDashboardStats);

module.exports = router;
