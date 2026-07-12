const { uploadStream } = require('../services/cloudinary.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Upload an attachment (image, video, or PDF)
// @route   POST /api/uploads
// @access  Private / Public (Allow public reports to upload evidence)
const uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json(errorResponse('No file provided in request. Use multipart form parameter: "file"'));
    }

    // Upload to Cloudinary under attachments namespace
    const uploadResult = await uploadStream(
      req.file.buffer,
      'maintainiq/attachments',
      req.file.originalname
    );

    return res.status(200).json(
      successResponse('File uploaded successfully', {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        format: uploadResult.format
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadAttachment
};
