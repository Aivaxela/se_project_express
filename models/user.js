const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const SignInFailError = require("../errors/signin-fail");
const BadRequestError = require("../errors/bad-request");
const {
  badRequestErrorMessage,
  signinFailMessage,
} = require("../utils/errors");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 2,
    maxlength: 30,
    validate: {
      validator(value) {
        return validator.isEmail(value);
      },
      message: "You must enter a valid email address",
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  avatarUrl: {
    type: String,
    validate: {
      validator(value) {
        return !value || validator.isURL(value);
      },
      message: "You must enter a valid URL",
    },
  },
});

userSchema.statics.findUserByCredentials = function findUserByCredentials(
  email,
  password
) {
  if (!email || !password) {
    throw new BadRequestError(badRequestErrorMessage);
  }
  return this.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!user) {
        throw new SignInFailError(signinFailMessage);
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          throw new SignInFailError(signinFailMessage);
        }

        return user;
      });
    });
};

module.exports = mongoose.model("user", userSchema);
