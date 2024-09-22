const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

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
    select: false,
  },
  avatar: {
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
    const error = new Error();
    error.name = "ValidationError";
    return Promise.reject(error);
  }
  return this.findOne({ email })
    .select("+password")
    .then((user) => {
      if (!user) {
        const error = new Error();
        error.name = "SignInFail";
        return Promise.reject(error);
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          const error = new Error();
          error.name = "SignInFail";
          return Promise.reject(error);
        }

        return user;
      });
    });
};

module.exports = mongoose.model("user", userSchema);
