const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME || 'test_name',
  api_key: process.env.CLOUDINARY_KEY || 'test_key',
  api_secret: process.env.CLOUDINARY_SECRET || 'test_secret'
});

console.log('[Cloudinary] SDK Initialized.');

module.exports = cloudinary;
