/**
 * Standard Success API Response
 * @param {string} message - Response message description
 * @param {object|array} data - Response payoad data
 * @returns {object} formatted object
 */
const successResponse = (message = 'Operation successful', data = {}) => {
  return {
    success: true,
    message,
    data
  };
};

/**
 * Standard Error API Response
 * @param {string} message - Error explanation message
 * @param {array} errors - Detailed list of validation or execution errors
 * @returns {object} formatted object
 */
const errorResponse = (message = 'An error occurred', errors = []) => {
  return {
    success: false,
    message,
    errors
  };
};

module.exports = {
  successResponse,
  errorResponse
};
