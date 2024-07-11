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

module.exports.deleteItem = (req, res) => {
  console.log("deleting a clothing item");

  Item.findByIdAndDelete(req.params.id)
    .orFail(() => {
      const error = new Error("Item not found");
      error.statusCode = 404;
      error.name = "NotFoundError";
      throw error;
    })
    .then((item) => {
      res.send({ data: item });
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
