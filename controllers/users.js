const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const {
  badRequest,
  unauthorized,
  serverError,
  itemNotFound,
  duplicateItem,
  defaultErrorMessage,
  duplicateEmailErrorMessage,
  signinFailMessage,
} = require("../utils/errors");
const { JWT_SECRET } = require("../utils/config");

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
  const { name, avatar, email, password } = req.body;

  bcrypt.hash(req.body.password, 10).then((hash) =>
    User.create({ name, avatar, email, password: hash })
      .then((user) => res.send({ data: user }))
      .catch((err) => {
        console.error(err);

        if (err.name === "ValidationError") {
          res.status(badRequest).send({
            message: `Error code: ${badRequest}, Error message: ${err.message}`,
          });
        } else if (err.code === 11000) {
          res.status(duplicateItem).send({
            message: `Error code: ${duplicateItem}, Error message: ${duplicateEmailErrorMessage}`,
          });
        } else {
          res.status(serverError).send({
            message: `Error code: ${serverError}, Error message: ${defaultErrorMessage}`,
          });
        }
      })
  );
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch(() => {
      res.status(unauthorized).send({
        message: `Error code: ${unauthorized}, Error message: ${signinFailMessage}`,
      });
    });
};
