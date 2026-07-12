const express = require('express');
const router = express.Router();
const { uploadAttachment } = require('../controllers/upload.controller');
const upload = require('../middleware/upload');

// Accessible by both logged-in users and public reporters
router.post('/', upload.single('file'), uploadAttachment);

module.exports = router;
