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
    .then((user) => res.send({ data: user }))
    .catch((err) => res.status(404).send({ message: "User not found" }));
};

module.exports.createUser = (req, res) => {
  console.log("creating user");

  const { name, avatar } = req.body;

  User.create({ name, avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => res.status(500).send({ message: err.message }));
};
