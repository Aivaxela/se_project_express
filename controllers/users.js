const User = require("../models/user");

module.exports.getUsers = (req, res) => {
  console.log("getting users");

  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => res.status(500).send({ message: err.message }));
};

module.exports.getUser = (req, res) => {
  console.log("getting a user");

  User.findById(req.params.id)
    .orFail(() => {
      const error = new Error("User not found");
      error.statusCode = 404;
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
          res.status(400).send({
            message: `Error code: ${400}, Error reason: ${err.reason}`,
          });
          break;
        default:
          res.status(500).send({
            message: `Error code: ${500}, Error message: ${err.message}`,
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
        res.status(400).send({
          message: `Error code: ${400}, Error message: ${err.message}`,
        });
      } else {
        res.status(500).send({
          message: `Error code: ${500}, Error message: ${err.message}`,
        });
      }
    });
};
