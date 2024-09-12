const mongoose = require("mongoose");
const Item = require("../models/clothingItem");
const NotFoundError = require("../errors/not-found");
const BadRequestError = require("../errors/bad-request");
const DuplicateItemError = require("../errors/duplicate-item");

const {
  defaultErrorMessage,
  forbiddenErrorMessage,
  duplicateEmailErrorMessage,
  itemNotFoundMessage,
  castErrorMessage,
  validationErrorMessage,
} = require("../utils/errors");

//TODO: refactor controllers to remove handleFindReq functions

const handleFindReq = (itemQuery, req, next) =>
  itemQuery
    .orFail(() => {
      throw new NotFoundError(itemNotFoundMessage);
    })
    .then((item) => item)
    .catch((err) => {
      switch (err.name) {
        case "ValidationError":
          next(new BadRequestError(validationErrorMessage));
          break;
        case "CastError":
          next(new BadRequestError(castErrorMessage));
          break;
        default:
          next(err);
          break;
      }
    });

module.exports.getItems = (req, res, next) => {
  const itemQuery = Item.find({}).populate("owner", {
    name: 1,
    _id: 1,
    imageUrl: 1,
  });
  handleFindReq(itemQuery, req, next).then((items) =>
    res.send({ data: items })
  );
};

module.exports.createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;

  Item.create({ name, weather, imageUrl, owner: req.user._id }).then((item) => {
    const itemQuery = Item.findById(item._id).populate("owner", {
      name: 1,
      _id: 1,
      imageUrl: 1,
    });
    handleFindReq(itemQuery, req, next).then((item) => {
      if (item) res.send({ data: item });
    });
  });
};

module.exports.deleteItem = (req, res) => {
  const requestingUser = req.user._id;

  Item.findById(req.params.id)

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
        }).populate("owner", { name: 1, _id: 1, avatarUrl: 1 });
        handleFindReq(itemQuery, res);
      } else {
        res.status(forbidden).send({
          message: `Error code: ${forbidden}, Error message: ${forbiddenErrorMessage}`,
        });
      }
    })
    .catch((err) => {
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
  ).populate("owner", { name: 1, _id: 1, avatarUrl: 1 });
  handleFindReq(itemQuery, res);
};

module.exports.dislikeItem = (req, res) => {
  const itemQuery = Item.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user._id } },
    { new: true }
  ).populate("owner", { name: 1, _id: 1, avatarUrl: 1 });
  handleFindReq(itemQuery, res);
};
