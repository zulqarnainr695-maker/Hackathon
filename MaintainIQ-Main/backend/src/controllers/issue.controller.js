const Issue = require('../models/Issue');
const Asset = require('../models/Asset');
const MaintenanceHistory = require('../models/MaintenanceHistory');
const User = require('../models/User');
const { notifyIssueAssigned, notifyStatusUpdated, notifyMaintenanceCompleted } = require('../sockets/socket');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Helper to log history
const logHistory = async (assetId, actorId, action, description, issueId) => {
  try {
    await MaintenanceHistory.create({
      asset: assetId,
      actor: actorId,
      action,
      description,
      issue: issueId
    });
  } catch (error) {
    console.error(`[History Log Error] Failed for ${action}:`, error.message);
  }
};

// @desc    Report an issue (public or authenticated)
// @route   POST /api/issues
// @access  Public / Private
const createIssue = async (req, res, next) => {
  try {
    const { asset, title, description, priority, category, reporterName, reporterEmail, reporterPhone, attachments } = req.body;

    // Verify asset exists
    const targetAsset = await Asset.findById(asset);
    if (!targetAsset) {
      return res.status(404).json(errorResponse('Associated asset not found'));
    }

    // Determine reporter info
    let finalReporterName = reporterName;
    let finalReporterEmail = reporterEmail;
    let finalReporterPhone = reporterPhone || '';
    let actorId;

    if (req.user) {
      // Authenticated report
      finalReporterName = req.user.name;
      finalReporterEmail = req.user.email;
      finalReporterPhone = req.user.phone || '';
      actorId = req.user.id;
    } else {
      // Public report: find a default admin to act as "actor" in history or look up by email
      const systemAdmin = await User.findOne({ role: 'Admin' });
      actorId = systemAdmin ? systemAdmin._id : targetAsset.createdBy;
    }

    const issue = await Issue.create({
      asset,
      title,
      description,
      priority: priority || 'Low',
      category,
      reporterName: finalReporterName,
      reporterEmail: finalReporterEmail,
      reporterPhone: finalReporterPhone,
      attachments: attachments || [],
      status: 'Reported'
    });

    // Update Asset Status to 'Issue Reported'
    targetAsset.status = 'Issue Reported';
    await targetAsset.save();

    // Log History
    await logHistory(
      targetAsset._id,
      actorId,
      'Issue Reported',
      `Issue reported: "${title}" by ${finalReporterName}. Asset status set to 'Issue Reported'.`,
      issue._id
    );

    const populatedIssue = await Issue.findById(issue._id).populate('asset', 'name assetCode status');

    // Notify admins
    notifyStatusUpdated(populatedIssue);

    return res.status(201).json(successResponse('Issue reported successfully', populatedIssue));
  } catch (error) {
    next(error);
  }
};

// @desc    Get all issues (paginated, filtered, searched)
// @route   GET /api/issues
// @access  Private (Admin / Tech)
const getIssues = async (req, res, next) => {
  try {
    const { priority, status, category, date, page = 1, limit = 10, search, myIssues } = req.query;
    const filter = {};

    if (priority) filter.priority = priority;
    if (status) filter.status = status;
    if (category) filter.category = category;
    
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lt: end };
    }

    // Technician role specific: if myIssues is true or they are a technician, filter to their assigned issues
    if (req.user.role === 'Technician' || myIssues === 'true') {
      if (myIssues === 'true' || req.user.role === 'Technician') {
        filter.assignedTechnician = req.user.id;
      }
    }

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { reporterName: new RegExp(search, 'i') },
        { issueNumber: new RegExp(search, 'i') }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skipNum = (pageNum - 1) * limitNum;

    const total = await Issue.countDocuments(filter);
    const issues = await Issue.find(filter)
      .populate('asset', 'name assetCode status location condition')
      .populate('assignedTechnician', 'name email avatar phone')
      .sort({ createdAt: -1 })
      .skip(skipNum)
      .limit(limitNum);

    return res.status(200).json(
      successResponse('Issues retrieved successfully', {
        issues,
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

// @desc    Get issue by ID
// @route   GET /api/issues/:id
// @access  Private (Admin / Tech)
const getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('asset', 'name assetCode status location condition qrCode description specifications criticality lastServiceDate nextServiceDate')
      .populate('assignedTechnician', 'name email role phone avatar');

    if (!issue) {
      return res.status(404).json(errorResponse('Issue not found'));
    }

    return res.status(200).json(successResponse('Issue retrieved successfully', issue));
  } catch (error) {
    next(error);
  }
};

// @desc    Assign a technician to an issue
// @route   PUT /api/issues/:id/assign
// @access  Private (Admin Only)
const assignTechnician = async (req, res, next) => {
  try {
    const { assignedTechnician } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json(errorResponse('Issue not found'));
    }

    // Business Rule: Closed issues cannot be edited
    if (issue.status === 'Closed') {
      return res.status(400).json(errorResponse('Cannot assign technician to a closed issue. Reopen the issue first.'));
    }

    const tech = await User.findById(assignedTechnician);
    if (!tech || tech.role !== 'Technician') {
      return res.status(400).json(errorResponse('Please assign a valid technician user'));
    }

    const prevTechId = issue.assignedTechnician;
    issue.assignedTechnician = assignedTechnician;
    issue.status = 'Assigned';
    await issue.save();

    // Log History
    await logHistory(
      issue.asset,
      req.user.id,
      'Assigned',
      `Assigned technician ${tech.name} to issue ${issue.issueNumber}.`,
      issue._id
    );

    if (prevTechId?.toString() !== assignedTechnician.toString()) {
      await logHistory(
        issue.asset,
        req.user.id,
        'Technician Changed',
        `Technician changed to ${tech.name} for issue ${issue.issueNumber}.`,
        issue._id
      );
    }

    // Emit Real-time Socket Event
    notifyIssueAssigned(assignedTechnician, issue);

    return res.status(200).json(successResponse(`Issue assigned to ${tech.name}`, issue));
  } catch (error) {
    next(error);
  }
};

// @desc    Start inspection of an issue
// @route   PUT /api/issues/:id/inspect
// @access  Private (Technician Only)
const startInspection = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json(errorResponse('Issue not found'));
    }

    // Business Rule: Closed issues cannot be edited
    if (issue.status === 'Closed') {
      return res.status(400).json(errorResponse('Closed issue cannot be inspected.'));
    }

    // Business Rule: Technician can update ONLY assigned issues
    if (issue.assignedTechnician?.toString() !== req.user.id.toString()) {
      return res.status(403).json(errorResponse('Access denied. You can only inspect issues assigned to you.'));
    }

    issue.status = 'Inspection Started';
    await issue.save();

    // Update Asset Status to 'Under Inspection'
    await Asset.findByIdAndUpdate(issue.asset, { status: 'Under Inspection' });

    // Log History
    await logHistory(
      issue.asset,
      req.user.id,
      'Inspection Started',
      `Technician ${req.user.name} started inspection on issue ${issue.issueNumber}. Asset status set to 'Under Inspection'.`,
      issue._id
    );

    // Emit Socket
    notifyStatusUpdated(issue);

    return res.status(200).json(successResponse('Inspection started successfully', issue));
  } catch (error) {
    next(error);
  }
};

// @desc    Update issue status manually
// @route   PUT /api/issues/:id/status
// @access  Private (Admin / Assigned Technician)
const updateIssueStatus = async (req, res, next) => {
  try {
    const { status, inspectionNotes } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json(errorResponse('Issue not found'));
    }

    // Business Rule: Closed issues cannot be edited
    if (issue.status === 'Closed') {
      return res.status(400).json(errorResponse('Closed issue status cannot be modified.'));
    }

    // Business Rule: Technician can update ONLY assigned issues
    if (req.user.role === 'Technician' && issue.assignedTechnician?.toString() !== req.user.id.toString()) {
      return res.status(403).json(errorResponse('Access denied. You can only update issues assigned to you.'));
    }

    const oldStatus = issue.status;
    issue.status = status;
    if (inspectionNotes) issue.inspectionNotes = inspectionNotes;

    await issue.save();

    // Auto-update Asset status based on Issue status
    let assetStatus;
    if (['Maintenance In Progress', 'Waiting for Parts'].includes(status)) {
      assetStatus = 'Under Maintenance';
    } else if (status === 'Inspection Started') {
      assetStatus = 'Under Inspection';
    } else if (status === 'Reported') {
      assetStatus = 'Issue Reported';
    }

    if (assetStatus) {
      await Asset.findByIdAndUpdate(issue.asset, { status: assetStatus });
      await logHistory(
        issue.asset,
        req.user.id,
        'Status Changed',
        `Issue ${issue.issueNumber} status changed from ${oldStatus} to ${status}. Asset status set to ${assetStatus}.`,
        issue._id
      );
    } else {
      await logHistory(
        issue.asset,
        req.user.id,
        'Status Changed',
        `Issue ${issue.issueNumber} status changed from ${oldStatus} to ${status}.`,
        issue._id
      );
    }

    notifyStatusUpdated(issue);

    return res.status(200).json(successResponse(`Issue status updated to ${status}`, issue));
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve an issue
// @route   PUT /api/issues/:id/resolve
// @access  Private (Technician Only)
const resolveIssue = async (req, res, next) => {
  try {
    const { maintenanceNotes, maintenanceCost, partsUsed, nextServiceDate } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json(errorResponse('Issue not found'));
    }

    // Business Rule: Closed issues cannot be edited
    if (issue.status === 'Closed') {
      return res.status(400).json(errorResponse('Cannot resolve a closed issue.'));
    }

    // Business Rule: Technician can update ONLY assigned issues
    if (issue.assignedTechnician?.toString() !== req.user.id.toString()) {
      return res.status(403).json(errorResponse('Access denied. You can only resolve issues assigned to you.'));
    }

    // Business Rule: Resolved issue must contain maintenance notes (checked by schema pre-save, but double checked here)
    if (!maintenanceNotes || maintenanceNotes.trim() === '') {
      return res.status(400).json(errorResponse('Maintenance notes are required to resolve the issue.'));
    }

    issue.status = 'Resolved';
    issue.maintenanceNotes = maintenanceNotes;
    issue.maintenanceCost = maintenanceCost || 0;
    issue.partsUsed = partsUsed || [];
    issue.resolvedDate = new Date();

    await issue.save();

    // Revert Asset to Operational and update service dates
    const asset = await Asset.findById(issue.asset);
    if (asset) {
      asset.status = 'Operational';
      asset.lastServiceDate = new Date();
      if (nextServiceDate) {
        asset.nextServiceDate = new Date(nextServiceDate);
      }
      await asset.save();
    }

    // Log History
    await logHistory(
      issue.asset,
      req.user.id,
      'Maintenance Completed',
      `Issue ${issue.issueNumber} resolved by technician ${req.user.name}. Cost: $${issue.maintenanceCost}. Asset status set to 'Operational'.`,
      issue._id
    );

    // Emit Socket Notifications
    notifyStatusUpdated(issue);
    if (asset) {
      notifyMaintenanceCompleted(issue, asset);
    }

    return res.status(200).json(successResponse('Issue resolved successfully', issue));
  } catch (error) {
    next(error);
  }
};

// @desc    Close an issue
// @route   PUT /api/issues/:id/close
// @access  Private (Admin Only)
const closeIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json(errorResponse('Issue not found'));
    }

    issue.status = 'Closed';
    await issue.save();

    await logHistory(
      issue.asset,
      req.user.id,
      'Status Changed',
      `Issue ${issue.issueNumber} closed by administrator.`,
      issue._id
    );

    notifyStatusUpdated(issue);

    return res.status(200).json(successResponse('Issue closed successfully', issue));
  } catch (error) {
    next(error);
  }
};

// @desc    Reopen an issue
// @route   PUT /api/issues/:id/reopen
// @access  Private (Admin Only)
const reopenIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json(errorResponse('Issue not found'));
    }

    issue.status = 'Reopened';
    await issue.save();

    // Set asset back to Issue Reported
    await Asset.findByIdAndUpdate(issue.asset, { status: 'Issue Reported' });

    await logHistory(
      issue.asset,
      req.user.id,
      'Status Changed',
      `Issue ${issue.issueNumber} reopened by administrator. Asset status set to 'Issue Reported'.`,
      issue._id
    );

    notifyStatusUpdated(issue);

    return res.status(200).json(successResponse('Issue reopened successfully', issue));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createIssue,
  getIssues,
  getIssueById,
  assignTechnician,
  startInspection,
  updateIssueStatus,
  resolveIssue,
  closeIssue,
  reopenIssue
};
