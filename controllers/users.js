const User = require("../models/user");
const { badRequest, serverError, itemNotFound } = require("../utils/errors");

module.exports.getUsers = (req, res) => {
  console.log("getting users");

  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => res.status(serverError).send({ message: err.message }));
};

module.exports.getUser = (req, res) => {
  console.log("getting a user");

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
      console.error("error: " + err);

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
            message: `Error code: ${serverError}, Error message: ${err.message}`,
          });
          break;
      }
    });
};

module.exports.createUser = (req, res) => {
  console.log("creating user");

  const { name, avatar } = req.body;
  User.create({ name, avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      console.error("error: " + err);

      if (err.name === "ValidationError") {
        res.status(badRequest).send({
          message: `Error code: ${badRequest}, Error message: ${err.message}`,
        });
      } else {
        res.status(serverError).send({
          message: `Error code: ${serverError}, Error message: ${err.message}`,
        });
      }
    });
};
