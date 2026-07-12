const express = require('express');
const router = express.Router();
const { performTriage, saveTriage } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth');
const { aiTriageLimiter } = require('../middleware/rateLimiter');

router.use(protect);

router.post('/triage', aiTriageLimiter, performTriage);
router.post('/triage/save', saveTriage);

module.exports = router;
