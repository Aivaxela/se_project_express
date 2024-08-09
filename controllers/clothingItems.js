const mongoose = require("mongoose");
const Item = require("../models/clothingItem");

const {
  badRequest,
  forbidden,
  serverError,
  itemNotFound,
  defaultErrorMessage,
  forbiddenErrorMessage,
} = require("../utils/errors");

module.exports.getItems = (req, res) => {
  Item.find({})
    .populate("owner")
    .then((items) => res.send({ data: items }))
    .catch(() =>
      res.status(serverError).send({ message: defaultErrorMessage })
    );
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
          message: `Error code: ${serverError}, Error message: ${defaultErrorMessage}`,
        });
      }
    });
};

module.exports.deleteItem = (req, res) => {
  const requestingUser = req.user._id;

  const itemQuery = Item.findById(req.params.id)
    .orFail(() => {
      const error = new Error("Item not found");
      error.statusCode = itemNotFound;
      error.name = "NotFoundError";
      throw error;
    })
    .then((item) => {
      const itemOwner = mongoose.Types.ObjectId(item.owner).toString();

      if (requestingUser === itemOwner) {
        const itemQuery = Item.findByIdAndDelete({
          _id: req.params.id,
        });
        handleRequest(itemQuery, res);
      } else {
        res.status(forbidden).send({
          message: `Error code: ${forbidden}, Error message: ${forbiddenErrorMessage}`,
        });
      }
    })
    .catch((err) => {
      console.log(err.name);

      if (err.name === "CastError") {
        res.status(badRequest).send({
          message: `Error code: ${badRequest}, Error reason: ${err.reason}`,
        });
      } else if (err.name === "NotFoundError") {
        res.status(err.statusCode).send({
          message: `Error code: ${err.statusCode}, Error message: ${err.message}`,
        });
      } else {
        res.status(badRequest).send({
          message: `Error code: ${badRequest}, Error message: ${defaultErrorMessage}`,
        });
      }
    });
};

module.exports.likeItem = (req, res) => {
  const itemQuery = Item.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  );
  handleRequest(itemQuery, res);
};

module.exports.dislikeItem = (req, res) => {
  const itemQuery = Item.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user._id } },
    { new: true }
  );
  handleRequest(itemQuery, res);
};

const handleRequest = (itemQuery, res) => {
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
            message: `Error code: ${serverError}, Error message: ${defaultErrorMessage}`,
          });
          break;
      }
    });
};
