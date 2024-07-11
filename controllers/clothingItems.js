const Item = require("../models/clothingItem");
const { badRequest, serverError, itemNotFound } = require("../utils/errors");

const handleIdRequest = (itemQuery, res) => {
  itemQuery
    .orFail(() => {
      const error = new Error("Item not found");
      error.statusCode = itemNotFound;
      error.name = "NotFoundError";
      throw error;
    })
    .then((item) => {
      res.send({ data: item });
    })
    .catch((err) => {
      console.error(err);

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

module.exports.getItems = (req, res) => {
  Item.find({})
    .populate("owner")
    .then((items) => res.send({ data: items }))
    .catch((err) => res.status(serverError).send({ message: err.message }));
};

module.exports.createItem = (req, res) => {
  const { name, weather, imageUrl } = req.body;

  Item.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) => res.send({ data: item }))
    .catch((err) => {
      console.error(err);

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

module.exports.deleteItem = (req, res) => {
  const itemQuery = Item.findByIdAndDelete(req.params.id);
  handleIdRequest(itemQuery, res);
};

module.exports.likeItem = (req, res) => {
  const itemQuery = Item.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  );
  handleIdRequest(itemQuery, res);
};

module.exports.dislikeItem = (req, res) => {
  const itemQuery = Item.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user._id } },
    { new: true }
  );
  handleIdRequest(itemQuery, res);
};
