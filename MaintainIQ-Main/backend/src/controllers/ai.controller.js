const Asset = require('../models/Asset');
const MaintenanceHistory = require('../models/MaintenanceHistory');
const AITriage = require('../models/AITriage');
const Issue = require('../models/Issue');
const { analyzeComplaint } = require('../services/ai.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Perform AI Diagnostic Triage on a Complaint
// @route   POST /api/ai/triage
// @access  Private (Admin / Tech)
const performTriage = async (req, res, next) => {
  try {
    const { assetId, complaint } = req.body;

    if (!assetId || !complaint) {
      return res.status(400).json(errorResponse('Asset ID and complaint text are required'));
    }

    const asset = await Asset.findById(assetId);
    if (!asset) {
      return res.status(404).json(errorResponse('Asset not found'));
    }

    // Fetch past 5 history logs for the asset to provide context
    const recentHistory = await MaintenanceHistory.find({ asset: assetId })
      .sort({ date: -1 })
      .limit(5)
      .select('action description date');

    const assetInfo = {
      name: asset.name,
      category: asset.category,
      location: asset.location,
      condition: asset.condition,
      specifications: asset.specifications || {}
    };

    // Run OpenAI diagnostic analyzer (or fallback)
    const triageResult = await analyzeComplaint(assetInfo, complaint, recentHistory);

    return res.status(200).json(successResponse('AI triage analysis completed', triageResult));
  } catch (error) {
    next(error);
  }
};

// @desc    Save/Log Edited AI Triage Results associated with an Issue
// @route   POST /api/ai/triage/save
// @access  Private (Admin / Tech)
const saveTriage = async (req, res, next) => {
  try {
    const { issueId, originalComplaint, aiTitle, aiCategory, aiPriority, possibleCauses, diagnosticChecks, editedByUser } = req.body;

    if (!issueId || !aiTitle || !aiCategory || !aiPriority) {
      return res.status(400).json(errorResponse('Issue reference, title, category, and priority are required'));
    }

    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json(errorResponse('Associated issue not found'));
    }

    const triage = await AITriage.create({
      issue: issueId,
      originalComplaint,
      aiTitle,
      aiCategory,
      aiPriority,
      possibleCauses: possibleCauses || [],
      diagnosticChecks: diagnosticChecks || [],
      editedByUser: editedByUser || false
    });

    return res.status(201).json(successResponse('AI triage report recorded successfully', triage));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  performTriage,
  saveTriage
};
