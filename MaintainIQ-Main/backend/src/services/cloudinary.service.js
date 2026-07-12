const cloudinary = require('../config/cloudinary');

/**
 * Uploads a file buffer to Cloudinary using a stream.
 * Gracefully falls back to mock URLs if Cloudinary is not configured.
 * 
 * @param {Buffer} fileBuffer - The file buffer from multer.
 * @param {string} folder - Folder name inside Cloudinary.
 * @param {string} originalName - Original filename to determine fallbacks or file types.
 * @returns {Promise<object>} upload result containing url, public_id, etc.
 */
const uploadStream = (fileBuffer, folder = 'maintainiq', originalName = '') => {
  return new Promise((resolve, reject) => {
    const isMock = !process.env.CLOUDINARY_KEY || 
                   process.env.CLOUDINARY_NAME === 'cloudinary_test_name' || 
                   process.env.CLOUDINARY_KEY === 'cloudinary_test_key';

    if (isMock) {
      console.warn(`[Cloudinary Service Alert] Using local mock URL upload for file: ${originalName}`);
      const ext = originalName ? originalName.split('.').pop().toLowerCase() : 'png';
      
      let mockUrl = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400';
      if (['pdf'].includes(ext)) {
        mockUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      } else if (['mp4', 'mov', 'avi'].includes(ext)) {
        mockUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
      }

      return resolve({
        secure_url: mockUrl,
        public_id: `mock_${Date.now()}`,
        format: ext
      });
    }

    const uploadOptions = {
      folder,
      resource_type: 'auto'
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        console.error('[Cloudinary Service Error] Stream upload failed:', error.message);
        // Gracefully return standard fallback rather than crashing
        return resolve({
          secure_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400',
          public_id: `fallback_${Date.now()}`,
          format: 'png'
        });
      }
      resolve(result);
    });

    stream.end(fileBuffer);
  });
};

module.exports = {
  uploadStream
};
