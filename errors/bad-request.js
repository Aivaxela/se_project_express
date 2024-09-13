const { badRequestErrorCode } = require("../utils/errors-messages-statuses");

module.exports = class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = badRequestErrorCode;
  }
};
