const { body } = require('express-validator');

const createAssetValidator = [
  body('assetCode')
    .notEmpty()
    .withMessage('Asset code is required')
    .trim(),
  body('name')
    .notEmpty()
    .withMessage('Asset name is required')
    .trim(),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .trim(),
  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .trim(),
  body('condition')
    .optional()
    .isIn(['Excellent', 'Good', 'Fair', 'Poor'])
    .withMessage('Condition must be Excellent, Good, Fair, or Poor'),
  body('status')
    .optional()
    .isIn(['Operational', 'Issue Reported', 'Under Inspection', 'Under Maintenance', 'Out of Service', 'Retired'])
    .withMessage('Invalid status code'),
  body('assignedTechnician')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Assigned technician must be a valid ID'),
  body('lastServiceDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Last service date must be a valid ISO8601 date'),
  body('nextServiceDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Next service date must be a valid ISO8601 date')
    .custom((value, { req }) => {
      // Next service date cannot be before completion/lastServiceDate
      if (req.body.lastServiceDate && new Date(value) < new Date(req.body.lastServiceDate)) {
        throw new Error('Next service date cannot be earlier than the last service date.');
      }
      return true;
    }),
  body('description')
    .optional()
    .trim()
];

const updateAssetValidator = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Asset name cannot be blank')
    .trim(),
  body('category')
    .optional()
    .notEmpty()
    .withMessage('Category cannot be blank')
    .trim(),
  body('location')
    .optional()
    .notEmpty()
    .withMessage('Location cannot be blank')
    .trim(),
  body('condition')
    .optional()
    .isIn(['Excellent', 'Good', 'Fair', 'Poor'])
    .withMessage('Condition must be Excellent, Good, Fair, or Poor'),
  body('status')
    .optional()
    .isIn(['Operational', 'Issue Reported', 'Under Inspection', 'Under Maintenance', 'Out of Service', 'Retired'])
    .withMessage('Invalid status code'),
  body('assignedTechnician')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Assigned technician must be a valid ID'),
  body('lastServiceDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Last service date must be a valid date'),
  body('nextServiceDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Next service date must be a valid date')
    .custom((value, { req }) => {
      const lastService = req.body.lastServiceDate;
      if (lastService && new Date(value) < new Date(lastService)) {
        throw new Error('Next service date cannot be earlier than the last service date.');
      }
      return true;
    })
];

module.exports = {
  createAssetValidator,
  updateAssetValidator
};
