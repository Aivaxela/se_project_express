const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const {
  badRequest,
  serverError,
  itemNotFound,
  duplicateItem,
  defaultErrorMessage,
  duplicateEmailErrorMessage,
} = require("../utils/errors");
const { JWT_SECRET } = require("../utils/config");

const handleRequest = (userQuery, res) => {
  userQuery
    .orFail(() => {
      const error = new Error("Item not found");
      error.statusCode = itemNotFound;
      error.name = "NotFoundError";
      throw error;
    })
    .then((item) => {
      res.send({ data: item });
    })
    .catch((err) => {
      console.error(err);

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
        case "ValidationError":
          res.status(badRequest).send({
            message: `Error code: ${badRequest}, Error message: ${err.message}`,
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

module.exports.login = (req, res) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch((err) => {
      if (err.statusCode) {
        res.status(err.statusCode).send({
          message: `Error code: ${err.statusCode}, Error message: ${err.message}`,
        });
      } else {
        res.status(serverError).send({
          message: `Error code: ${err.statusCode}, Error message: ${err.message}`,
        });
      }
    });
};

module.exports.createUser = (req, res) => {
  const { name, avatarUrl, email, password } = req.body;

  bcrypt.hash(password, 10).then((hash) =>
    User.create({ name, avatarUrl, email, password: hash })
      .then((user) => {
        const protectedUser = {
          name: user.name,
          avatarUrl: user.avatarUrl,
          email: user.email,
        };
        res.send({ data: protectedUser });
      })
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

module.exports.getCurrentUser = (req, res) => {
  const userQuery = User.findById(req.user._id);
  handleRequest(userQuery, res);
};

module.exports.updateProfile = (req, res) => {
  const userQuery = User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      avatarUrl: req.body.avatarUrl,
    },
    { returnDocument: "after", runValidators: true }
  );
  handleRequest(userQuery, res);
};
