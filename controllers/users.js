const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const NotFoundError = require("../errors/not-found");
const BadRequestError = require("../errors/bad-request");
const DuplicateItemError = require("../errors/duplicate-item");

const {
  duplicateEmailErrorMessage,
  userNotFoundMessage,
  castErrorMessage,
  validationErrorMessage,
} = require("../utils/errors");
const { JWT_SECRET } = require("../utils/config");

const handleFindReq = (userQuery, req, next) =>
  userQuery
    .orFail(() => {
      throw new NotFoundError(userNotFoundMessage);
    })
    .then((item) => item)
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

module.exports.getCurrentUser = (req, res, next) => {
  const userQuery = User.findById(req.user._id);
  handleFindReq(userQuery, res, next).then((item) => res.send({ data: item }));
};

module.exports.updateProfile = (req, res, next) => {
  const userQuery = User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      avatarUrl: req.body.avatarUrl,
    },
    { returnDocument: "after", runValidators: true }
  );
  handleFindReq(userQuery, res, next).then((item) => res.send({ data: item }));
};

module.exports.createUser = (req, res, next) => {
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
          next(new BadRequestError(validationErrorMessage));
        } else if (err.code === 11000) {
          next(new DuplicateItemError(duplicateEmailErrorMessage));
        } else {
          next(err);
        }
      })
  );
};
