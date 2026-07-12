const express = require('express');
const router = express.Router();
const {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  getPublicAsset,
  getPublicAssetHistory,
  downloadQR,
  printLabel
} = require('../controllers/asset.controller');
const { createAssetValidator, updateAssetValidator } = require('../validations/asset.validation');
const validateRequest = require('../middleware/validation');
const { protect, authorize } = require('../middleware/auth');

// PUBLIC ENDPOINTS (No Auth)
router.get('/public/:id', getPublicAsset);
router.get('/public/:id/history', getPublicAssetHistory);

// SECURED ENDPOINTS (Requires Login)
router.use(protect);

router.get('/', authorize('Admin', 'Technician'), getAssets);
router.get('/:id', authorize('Admin', 'Technician'), getAssetById);
router.get('/:id/qr/download', authorize('Admin', 'Technician'), downloadQR);
router.get('/:id/qr/print', authorize('Admin', 'Technician'), printLabel);

// ADMIN ONLY WRITE ACTIONS
router.post('/', authorize('Admin'), createAssetValidator, validateRequest, createAsset);
router.put('/:id', authorize('Admin'), updateAssetValidator, validateRequest, updateAsset);
router.delete('/:id', authorize('Admin'), deleteAsset);

module.exports = router;
