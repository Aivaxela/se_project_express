const BadRequestError = require("../errors/bad-request");
const DuplicateItemError = require("../errors/duplicate-item");
const {
  castErrorMessage,
  validationErrorMessage,
  signinFailErrorMessage,
  duplicateEmailErrorMessage,
  defaultErrorMessage,
  dataMissingErrorMessage,
} = require("../utils/errors-messages-statuses");
const SignInFailError = require("../errors/signin-fail");

module.exports.errorHandler = (err, req, res, next) => {
  console.log(err);

  if (err.code === 11000)
    throw new DuplicateItemError(duplicateEmailErrorMessage);

  switch (err.name) {
    case "CastError":
      throw new BadRequestError(castErrorMessage);
    case "ValidationError":
      throw new BadRequestError(validationErrorMessage);
    case "SignInFail":
      throw new SignInFailError(signinFailErrorMessage);
    case "DataMissing":
      throw new BadRequestError(dataMissingErrorMessage);
    default:
      const { statusCode = 500, message } = err;
      res.status(statusCode).send({
        message: statusCode === 500 ? defaultErrorMessage : message,
      });
      break;
  }
};
