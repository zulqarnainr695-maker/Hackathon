const express = require('express');
const router = express.Router();
const { getHistoryTimeline, getAssetHistory } = require('../controllers/maintenance.controller');
const { protect, authorize } = require('../middleware/auth');

// Secure all timeline queries
router.use(protect);
router.use(authorize('Admin', 'Technician'));

router.get('/timeline', getHistoryTimeline);
router.get('/asset/:assetId', getAssetHistory);

module.exports = router;
