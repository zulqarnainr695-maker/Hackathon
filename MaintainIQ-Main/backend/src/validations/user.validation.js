const { body } = require('express-validator');

const createUserValidator = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['Admin', 'Technician'])
    .withMessage('Role must be either Admin or Technician'),
  body('phone')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be Active or Inactive')
];

const updateUserValidator = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Name cannot be blank')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['Admin', 'Technician'])
    .withMessage('Role must be either Admin or Technician'),
  body('phone')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage('Status must be Active or Inactive')
];

module.exports = {
  createUserValidator,
  updateUserValidator
};
