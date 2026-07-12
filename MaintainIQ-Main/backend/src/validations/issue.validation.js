const { body } = require('express-validator');

const createIssueValidator = [
  body('asset')
    .notEmpty()
    .withMessage('Asset reference is required')
    .isMongoId()
    .withMessage('Asset must be a valid Mongo ID'),
  body('reporterName')
    .notEmpty()
    .withMessage('Reporter name is required')
    .trim(),
  body('reporterEmail')
    .isEmail()
    .withMessage('Reporter email must be a valid email')
    .normalizeEmail(),
  body('reporterPhone')
    .optional()
    .trim(),
  body('title')
    .notEmpty()
    .withMessage('Issue title is required')
    .trim(),
  body('description')
    .notEmpty()
    .withMessage('Issue description is required')
    .trim(),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Emergency'])
    .withMessage('Priority must be Low, Medium, High, or Emergency'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .trim()
];

const resolveIssueValidator = [
  body('maintenanceNotes')
    .notEmpty()
    .withMessage('Maintenance notes are required to resolve an issue')
    .trim(),
  body('maintenanceCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maintenance cost cannot be negative'),
  body('partsUsed')
    .optional()
    .isArray()
    .withMessage('Parts used must be an array of strings'),
  body('nextServiceDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Next service date must be a valid ISO8601 date')
    .custom((value) => {
      // Next service date cannot be before today/completion date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(value) < today) {
        throw new Error('Next service date cannot be in the past.');
      }
      return true;
    })
];

const assignIssueValidator = [
  body('assignedTechnician')
    .notEmpty()
    .withMessage('Technician ID is required')
    .isMongoId()
    .withMessage('Technician must be a valid Mongo ID')
];

module.exports = {
  createIssueValidator,
  resolveIssueValidator,
  assignIssueValidator
};
