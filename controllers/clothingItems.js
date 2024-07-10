const Item = require("../models/clothingItem");

module.exports.getItems = (req, res) => {
  console.log("getting clothing items");

  Item.find({})
    .populate("owner")
    .then((items) => res.send({ data: items }))
    .catch((err) => res.status(500).send({ message: err.message }));
};

module.exports.createItem = (req, res) => {
  console.log("creating clothing item");

  const { name, weather, imageUrl, ownerId } = req.body;

  Item.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) => res.send({ data: item }))
    .catch((err) => res.status(500).send({ message: err.message }));
};

module.exports.deleteItem = (req, res) => {
  console.log("deleting a clothing item");

  Item.findByIdAndDelete(req.params.id)
    .then((item) => res.send({ data: item }))
    .catch(() => res.status(404).send({ message: "Item not found" }));
};

const sendData = (item, res, statusCode, statusMessage) => {
  res
    .send({ data: item })
    .catch((err) => res.status(statusCode).send({ message: statusMessage }));
};
