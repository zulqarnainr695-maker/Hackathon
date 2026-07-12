const QRCode = require('qrcode');
const { uploadStream } = require('./cloudinary.service');

/**
 * Generates a QR Code pointing to the public asset detail page,
 * uploads it to Cloudinary, and returns the URLs.
 * 
 * @param {string} assetId - The unique asset code or MongoDB ObjectId.
 * @returns {Promise<object>} Object containing qrCodeUrl and publicUrl
 */
const generateAssetQR = async (assetId) => {
  try {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const targetUrl = `${clientUrl}/public/assets/${assetId}`;

    // Create QR code as a PNG buffer with custom style matching MaintainIQ branding (deep indigo)
    const qrBuffer = await QRCode.toBuffer(targetUrl, {
      errorCorrectionLevel: 'H',
      type: 'png',
      margin: 4,
      width: 300,
      color: {
        dark: '#4f46e5', // Indigo-600
        light: '#ffffff' // Pure White
      }
    });

    // Upload to Cloudinary
    const uploadResult = await uploadStream(qrBuffer, 'maintainiq/qr_codes', `qr_${assetId}.png`);

    return {
      qrCodeUrl: uploadResult.secure_url,
      publicUrl: targetUrl
    };
  } catch (error) {
    console.error('[QR Service Error] Generation failed:', error.message);
    // Graceful fallback for demo/offline test
    const dummyUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      (process.env.CLIENT_URL || 'http://localhost:5173') + '/public/assets/' + assetId
    )}&color=4f46e5`;
    return {
      qrCodeUrl: dummyUrl,
      publicUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/public/assets/${assetId}`
    };
  }
};

module.exports = {
  generateAssetQR
};
