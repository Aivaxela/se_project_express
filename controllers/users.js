const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const NotFoundError = require("../errors/not-found");
const BadRequestError = require("../errors/bad-request");
const SignInFailError = require("../errors/signin-fail");

const {
  badRequest,
  serverError,
  duplicateItem,
  defaultErrorMessage,
  duplicateEmailErrorMessage,
  userNotFoundMessage,
  castErrorMessage,
  validationErrorMessage,
  signinFailMessage,
} = require("../utils/errors");
const { JWT_SECRET } = require("../utils/config");

const handleRequest = (userQuery, res, next) => {
  userQuery
    .orFail(() => {
      throw new NotFoundError(userNotFoundMessage);
    })
    .then((item) => {
      res.send({ data: item });
    })
    .catch((err) => {
      switch (err.name) {
        case "CastError":
          next(new BadRequestError(castErrorMessage));
          break;
        case "ValidationError":
          next(new BadRequestError(validationErrorMessage));
          break;
        default:
          next(err);
          break;
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      const id = mongoose.Types.ObjectId(user._id).toString();
      res.send({
        token,
        name: user.name,
        avatarUrl: user.avatarUrl,
        id,
      });
    })
    .catch(next);
};

module.exports.createUser = (req, res) => {
  const { name, avatarUrl, email, password } = req.body;

  bcrypt.hash(password, 10).then((hash) =>
    User.create({ name, avatarUrl, email, password: hash })
      .then((user) => {
        const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
          expiresIn: "7d",
        });
        res.send({
          token,
          name: user.name,
          avatarUrl: user.avatarUrl,
          email: user.email,
        });
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

module.exports.getCurrentUser = (req, res, next) => {
  const userQuery = User.findById(req.user._id);
  handleRequest(userQuery, res, next);
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
