const User = require("../models/user");
const {
  badRequest,
  serverError,
  itemNotFound,
  defaultErrorMessage,
} = require("../utils/errors");

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() =>
      res.status(serverError).send({ message: defaultErrorMessage })
    );
};

module.exports.getUser = (req, res) => {
  User.findById(req.params.id)
    .orFail(() => {
      const error = new Error("User not found");
      error.statusCode = itemNotFound;
      error.name = "NotFoundError";
      throw error;
    })
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      switch (err.name) {
        case "NotFoundError":
          res.status(err.statusCode).send({
            message: `Error code: ${err.statusCode}, Error message: ${err.message}`,
          });
          break;
        case "CastError":
          res.status(badRequest).send({
            message: `Error code: ${badRequest}, Error reason: ${err.reason}`,
          });
          break;
        default:
          res.status(serverError).send({
            message: `Error code: ${serverError}, Error message: ${defaultErrorMessage}`,
          });
          break;
      }
    });
};

module.exports.createUser = (req, res) => {
  const { name, avatar } = req.body;
  User.create({ name, avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      console.error(err);

      if (err.name === "ValidationError") {
        res.status(badRequest).send({
          message: `Error code: ${badRequest}, Error message: ${err.message}`,
        });
      } else {
        res.status(serverError).send({
          message: `Error code: ${serverError}, Error message: ${defaultErrorMessage}`,
        });
      }
    });
};
