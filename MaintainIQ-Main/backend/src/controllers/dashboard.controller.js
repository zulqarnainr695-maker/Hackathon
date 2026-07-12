const Asset = require('../models/Asset');
const Issue = require('../models/Issue');
const MaintenanceHistory = require('../models/MaintenanceHistory');
const { successResponse } = require('../utils/apiResponse');

// @desc    Get dashboard metrics and telemetry (Admin Only)
// @route   GET /api/dashboard
// @access  Private (Admin Only)
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total & Grouped Assets
    const totalAssets = await Asset.countDocuments();
    const assetsByStatus = await Asset.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const assetStats = {
      total: totalAssets,
      Operational: 0,
      'Issue Reported': 0,
      'Under Inspection': 0,
      'Under Maintenance': 0,
      'Out of Service': 0,
      Retired: 0
    };
    assetsByStatus.forEach(statusGroup => {
      if (statusGroup._id in assetStats) {
        assetStats[statusGroup._id] = statusGroup.count;
      }
    });

    // 2. Total & Grouped Issues
    const totalIssues = await Issue.countDocuments();
    const issuesByStatus = await Issue.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const issueStats = {
      total: totalIssues,
      Reported: 0,
      Assigned: 0,
      'Inspection Started': 0,
      'Maintenance In Progress': 0,
      'Waiting for Parts': 0,
      Resolved: 0,
      Closed: 0,
      Reopened: 0
    };
    issuesByStatus.forEach(statusGroup => {
      if (statusGroup._id in issueStats) {
        issueStats[statusGroup._id] = statusGroup.count;
      }
    });

    // 3. Issue Priority Counts
    const issuesByPriority = await Issue.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    const priorityStats = {
      Low: 0,
      Medium: 0,
      High: 0,
      Emergency: 0
    };
    issuesByPriority.forEach(prioGroup => {
      if (prioGroup._id in priorityStats) {
        priorityStats[prioGroup._id] = prioGroup.count;
      }
    });

    // 4. Sum of all maintenance costs
    const costAgg = await Issue.aggregate([
      { $group: { _id: null, totalCost: { $sum: '$maintenanceCost' } } }
    ]);
    const totalMaintenanceCost = costAgg[0]?.totalCost || 0;

    // 5. Recent Actions timeline (limit 10)
    const recentActivities = await MaintenanceHistory.find()
      .populate('asset', 'name assetCode')
      .populate('actor', 'name role avatar')
      .populate('issue', 'issueNumber title')
      .sort({ date: -1 })
      .limit(10);

    return res.status(200).json(
      successResponse('Dashboard analytics loaded', {
        assets: assetStats,
        issues: issueStats,
        priorities: priorityStats,
        totalCost: totalMaintenanceCost,
        recentActivities
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
