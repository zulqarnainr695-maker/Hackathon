const express = require('express');
const router = express.Router();
const {
  createIssue,
  getIssues,
  getIssueById,
  assignTechnician,
  startInspection,
  updateIssueStatus,
  resolveIssue,
  closeIssue,
  reopenIssue
} = require('../controllers/issue.controller');
const {
  createIssueValidator,
  resolveIssueValidator,
  assignIssueValidator
} = require('../validations/issue.validation');
const validateRequest = require('../middleware/validation');
const { protect, optionalProtect, authorize } = require('../middleware/auth');

// REPORT ISSUE: Publicly available, but will read user token if logged in
router.post('/', optionalProtect, createIssueValidator, validateRequest, createIssue);

// SECURED LIFECYCLE ROUTINGS
router.use(protect);

router.get('/', getIssues);
router.get('/:id', getIssueById);

// Administrative Assignment / Lock commands
router.put('/:id/assign', authorize('Admin'), assignIssueValidator, validateRequest, assignTechnician);
router.put('/:id/close', authorize('Admin'), closeIssue);
router.put('/:id/reopen', authorize('Admin'), reopenIssue);

// Technician Inspections & Resolution commands
router.put('/:id/inspect', authorize('Technician'), startInspection);
router.put('/:id/resolve', authorize('Technician'), resolveIssueValidator, validateRequest, resolveIssue);

// Shared Updates (Admin or the Technician assigned to the issue)
router.put('/:id/status', authorize('Admin', 'Technician'), updateIssueStatus);

module.exports = router;
