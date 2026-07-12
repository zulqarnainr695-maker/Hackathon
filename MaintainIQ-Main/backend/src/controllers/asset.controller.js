const Asset = require('../models/Asset');
const MaintenanceHistory = require('../models/MaintenanceHistory');
const User = require('../models/User');
const { generateAssetQR } = require('../services/qr.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const axios = require('axios');

// Helper to log asset history
const logAssetAction = async (assetId, actorId, action, description, issueId = null) => {
  try {
    await MaintenanceHistory.create({
      asset: assetId,
      actor: actorId,
      action,
      description,
      issue: issueId
    });
  } catch (error) {
    console.error(`[History Logging Error] Failed to log ${action} for asset ${assetId}:`, error.message);
  }
};

// @desc    Create asset (Generates QR automatically)
// @route   POST /api/assets
// @access  Private (Admin Only)
const createAsset = async (req, res, next) => {
  try {
    const { assetCode, name, category, location, condition, status, description, assignedTechnician } = req.body;

    const codeExists = await Asset.findOne({ assetCode: assetCode.trim() });
    if (codeExists) {
      return res.status(400).json(errorResponse('An asset with this code already exists. Please choose a unique code.'));
    }

    // 1. Create asset document first
    const asset = new Asset({
      assetCode: assetCode.trim(),
      name,
      category,
      location,
      condition: condition || 'Good',
      status: status || 'Operational',
      description: description || '',
      assignedTechnician: assignedTechnician || null,
      createdBy: req.user.id
    });

    // 2. Generate and upload QR Code pointing to public client URL
    const qrInfo = await generateAssetQR(asset.assetCode);
    asset.qrCode = qrInfo.qrCodeUrl;
    asset.publicUrl = qrInfo.publicUrl;

    await asset.save();

    // 3. Log History
    await logAssetAction(
      asset._id,
      req.user.id,
      'Asset Created',
      `Asset '${name}' registered with code ${asset.assetCode} under condition: ${asset.condition}`
    );

    // Populate technician details
    const populatedAsset = await Asset.findById(asset._id).populate('assignedTechnician', 'name email avatar');

    return res.status(201).json(successResponse('Asset created successfully', populatedAsset));
  } catch (error) {
    next(error);
  }
};

// @desc    Get all assets (paginated, sorted, filtered)
// @route   GET /api/assets
// @access  Private (Admin / Tech)
const getAssets = async (req, res, next) => {
  try {
    const { status, category, location, technician, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', search } = req.query;
    
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (location) filter.location = new RegExp(location, 'i'); // Case-insensitive matching

    if (technician) {
      filter.assignedTechnician = technician;
    }

    // Search query on name, assetCode, description
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { assetCode: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skipNum = (pageNum - 1) * limitNum;

    const sortOption = {};
    sortOption[sortBy] = order === 'asc' ? 1 : -1;

    const total = await Asset.countDocuments(filter);
    const assets = await Asset.find(filter)
      .populate('assignedTechnician', 'name email role phone avatar')
      .sort(sortOption)
      .skip(skipNum)
      .limit(limitNum);

    return res.status(200).json(
      successResponse('Assets retrieved successfully', {
        assets,
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

// @desc    Get asset by ID
// @route   GET /api/assets/:id
// @access  Private (Admin / Tech)
const getAssetById = async (req, res, next) => {
  try {
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/) 
      ? { _id: req.params.id }
      : { assetCode: req.params.id };

    const asset = await Asset.findOne(query)
      .populate('assignedTechnician', 'name email role phone avatar')
      .populate('createdBy', 'name email');

    if (!asset) {
      return res.status(404).json(errorResponse('Asset not found'));
    }

    return res.status(200).json(successResponse('Asset retrieved successfully', asset));
  } catch (error) {
    next(error);
  }
};

// @desc    Update asset details
// @route   PUT /api/assets/:id
// @access  Private (Admin Only)
const updateAsset = async (req, res, next) => {
  try {
    const { name, category, location, condition, status, description, assignedTechnician, lastServiceDate, nextServiceDate } = req.body;
    
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/) 
      ? { _id: req.params.id }
      : { assetCode: req.params.id };

    const asset = await Asset.findOne(query);
    if (!asset) {
      return res.status(404).json(errorResponse('Asset not found'));
    }

    const changes = [];
    if (name && name !== asset.name) {
      changes.push(`Name: '${asset.name}' -> '${name}'`);
      asset.name = name;
    }
    if (category && category !== asset.category) {
      changes.push(`Category: '${asset.category}' -> '${category}'`);
      asset.category = category;
    }
    if (location && location !== asset.location) {
      changes.push(`Location: '${asset.location}' -> '${location}'`);
      asset.location = location;
    }
    if (condition && condition !== asset.condition) {
      changes.push(`Condition: '${asset.condition}' -> '${condition}'`);
      asset.condition = condition;
    }
    if (status && status !== asset.status) {
      changes.push(`Status: '${asset.status}' -> '${status}'`);
      asset.status = status;
    }
    if (description !== undefined && description !== asset.description) {
      asset.description = description;
    }

    if (assignedTechnician !== undefined) {
      const prevTech = asset.assignedTechnician;
      if (assignedTechnician !== prevTech?.toString()) {
        asset.assignedTechnician = assignedTechnician || null;
        if (assignedTechnician) {
          const tech = await User.findById(assignedTechnician);
          changes.push(`Assigned Technician: '${tech ? tech.name : assignedTechnician}'`);
          // Log technician change history specifically
          await logAssetAction(asset._id, req.user.id, 'Technician Changed', `Assigned technician set to: ${tech ? tech.name : 'Unknown'}`);
        } else {
          changes.push('Assigned Technician: Removed assignment');
          await logAssetAction(asset._id, req.user.id, 'Technician Changed', 'Assigned technician removed');
        }
      }
    }

    if (lastServiceDate !== undefined) asset.lastServiceDate = lastServiceDate;
    if (nextServiceDate !== undefined) asset.nextServiceDate = nextServiceDate;

    if (changes.length > 0) {
      await asset.save();
      await logAssetAction(
        asset._id,
        req.user.id,
        'Asset Updated',
        `Updated properties: ${changes.join(', ')}`
      );
    } else {
      await asset.save();
    }

    const populatedAsset = await Asset.findById(asset._id).populate('assignedTechnician', 'name email role phone avatar');

    return res.status(200).json(successResponse('Asset updated successfully', populatedAsset));
  } catch (error) {
    next(error);
  }
};

// @desc    Delete asset
// @route   DELETE /api/assets/:id
// @access  Private (Admin Only)
const deleteAsset = async (req, res, next) => {
  try {
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/) 
      ? { _id: req.params.id }
      : { assetCode: req.params.id };

    const asset = await Asset.findOneAndDelete(query);
    if (!asset) {
      return res.status(404).json(errorResponse('Asset not found'));
    }

    return res.status(200).json(successResponse('Asset deleted successfully'));
  } catch (error) {
    next(error);
  }
};

// @desc    View public asset details (NO AUTH)
// @route   GET /api/assets/public/:id
// @access  Public
const getPublicAsset = async (req, res, next) => {
  try {
    // Search by assetCode OR by ObjectId to support scan routes
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/) 
      ? { _id: req.params.id }
      : { assetCode: req.params.id };

    const asset = await Asset.findOne(query)
      .populate('assignedTechnician', 'name email avatar')
      .select('-createdBy -createdAt -updatedAt -__v');

    if (!asset) {
      return res.status(404).json(errorResponse('Asset not found'));
    }

    // Return sanitized payload containing only safe parameters
    const sanitizedAsset = {
      id: asset._id,
      assetCode: asset.assetCode,
      name: asset.name,
      category: asset.category,
      location: asset.location,
      condition: asset.condition,
      status: asset.status,
      assignedTechnician: asset.assignedTechnician,
      lastServiceDate: asset.lastServiceDate,
      nextServiceDate: asset.nextServiceDate,
      qrCode: asset.qrCode,
      publicUrl: asset.publicUrl,
      description: asset.description
    };

    return res.status(200).json(successResponse('Public asset info retrieved', sanitizedAsset));
  } catch (error) {
    next(error);
  }
};

// @desc    View public asset history timeline (NO AUTH)
// @route   GET /api/assets/public/:id/history
// @access  Public
const getPublicAssetHistory = async (req, res, next) => {
  try {
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/) 
      ? { _id: req.params.id }
      : { assetCode: req.params.id };

    const asset = await Asset.findOne(query);
    if (!asset) {
      return res.status(404).json(errorResponse('Asset not found'));
    }

    // Expose only safe actions, omitting costs and internal technician details
    const history = await MaintenanceHistory.find({ asset: asset._id })
      .populate('actor', 'name avatar')
      .sort({ date: -1 });

    const sanitizedHistory = history.map(item => ({
      id: item._id,
      action: item.action,
      description: item.description,
      date: item.date,
      actor: {
        name: item.actor.name,
        avatar: item.actor.avatar
      }
    }));

    return res.status(200).json(successResponse('Public asset history timeline retrieved', sanitizedHistory));
  } catch (error) {
    next(error);
  }
};

// @desc    Download asset QR Code (Force download headers)
// @route   GET /api/assets/:id/qr/download
// @access  Private (Admin / Tech)
const downloadQR = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset || !asset.qrCode) {
      return res.status(404).json(errorResponse('Asset or QR code not found'));
    }

    // Stream download from Cloudinary with Content-Disposition headers
    try {
      const response = await axios({
        url: asset.qrCode,
        method: 'GET',
        responseType: 'stream'
      });
      res.setHeader('Content-Disposition', `attachment; filename="qr_${asset.assetCode}.png"`);
      res.setHeader('Content-Type', 'image/png');
      response.data.pipe(res);
    } catch (streamError) {
      // Graceful fallback to redirecting
      console.warn('[Asset Controller] Failed streaming QR, redirecting instead:', streamError.message);
      res.redirect(asset.qrCode);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Render print HTML layout for QR Label
// @route   GET /api/assets/:id/qr/print
// @access  Private (Admin / Tech)
const printLabel = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json(errorResponse('Asset not found'));
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Label - ${asset.assetCode}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background-color: #f1f5f9;
            }
            .label-card {
              background: white;
              border: 2px dashed #64748b;
              border-radius: 12px;
              padding: 24px;
              width: 320px;
              text-align: center;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            }
            .qr-image {
              width: 220px;
              height: 220px;
              margin: 0 auto 16px auto;
              border: 1px solid #e2e8f0;
              padding: 8px;
              border-radius: 8px;
            }
            h1 {
              font-size: 20px;
              color: #0f172a;
              margin: 0 0 8px 0;
              font-weight: 700;
            }
            .code {
              font-family: monospace;
              background-color: #f1f5f9;
              color: #4f46e5;
              padding: 4px 10px;
              border-radius: 4px;
              font-size: 14px;
              font-weight: 700;
              display: inline-block;
              margin-bottom: 8px;
            }
            .meta {
              font-size: 12px;
              color: #64748b;
              margin: 4px 0;
            }
            .print-btn {
              margin-top: 16px;
              background-color: #4f46e5;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 6px;
              font-weight: 600;
              cursor: pointer;
            }
            @media print {
              .print-btn {
                display: none;
              }
              body {
                background: white;
              }
              .label-card {
                box-shadow: none;
                border: 2px dashed #000;
              }
            }
          </style>
        </head>
        <body>
          <div class="label-card">
            <img class="qr-image" src="${asset.qrCode}" alt="QR Code" />
            <h1>${asset.name}</h1>
            <div class="code">${asset.assetCode}</div>
            <div class="meta">Category: ${asset.category}</div>
            <div class="meta">Location: ${asset.location}</div>
            <button class="print-btn" onclick="window.print()">Print Label</button>
          </div>
        </body>
      </html>
    `;
    res.send(html);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAsset,
  getAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  getPublicAsset,
  getPublicAssetHistory,
  downloadQR,
  printLabel
};
