const MaintenanceHistory = require('../models/MaintenanceHistory');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get complete platform maintenance history timeline
// @route   GET /api/maintenance/timeline
// @access  Private (Admin / Tech)
const getHistoryTimeline = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, action } = req.query;
    const filter = {};

    if (action) {
      filter.action = action;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skipNum = (pageNum - 1) * limitNum;

    const total = await MaintenanceHistory.countDocuments(filter);
    const history = await MaintenanceHistory.find(filter)
      .populate('asset', 'name assetCode status')
      .populate('actor', 'name email role avatar')
      .populate('issue', 'title issueNumber priority status')
      .sort({ date: -1 })
      .skip(skipNum)
      .limit(limitNum);

    return res.status(200).json(
      successResponse('Maintenance timeline retrieved successfully', {
        history,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      })
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get maintenance history specifically for an asset
// @route   GET /api/maintenance/asset/:assetId
// @access  Private (Admin / Tech)
const getAssetHistory = async (req, res, next) => {
  try {
    const assetId = req.params.assetId;

    const history = await MaintenanceHistory.find({ asset: assetId })
      .populate('actor', 'name role avatar')
      .populate('issue', 'title issueNumber status')
      .sort({ date: -1 });

    return res.status(200).json(successResponse('Asset maintenance log history retrieved', history));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHistoryTimeline,
  getAssetHistory
};
