const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const NotFoundError = require("../errors/not-found");
const { JWT_SECRET } = require("../utils/config");
const { userNotFoundMessage } = require("../utils/errors-messages-statuses");

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      next(new NotFoundError(userNotFoundMessage));
    })
    .then((item) => res.send({ data: item }))
    .catch(next);
};

module.exports.updateProfile = (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      avatarUrl: req.body.avatarUrl,
    },
    { returnDocument: "after", runValidators: true }
  )
    .then((item) => res.send({ data: item }))
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email.toLowerCase(), password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      console.log(token);
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

module.exports.createUser = (req, res, next) => {
  const { name, avatarUrl, email, password } = req.body;

  bcrypt.hash(password, 10).then((hash) =>
    User.create({ name, avatarUrl, email: email.toLowerCase(), password: hash })
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
      .catch(next)
  );
};
