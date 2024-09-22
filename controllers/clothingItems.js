const mongoose = require("mongoose");
const Item = require("../models/clothingItem");
const NotFoundError = require("../errors/not-found");
const ForbiddenError = require("../errors/forbidden");

const {
  itemNotFoundMessage,
  userNotFoundMessage,
  forbiddenErrorMessage,
} = require("../utils/errors-messages-statuses");

module.exports.getItems = (req, res, next) => {
  Item.find({})
    .populate("owner", {
      name: 1,
      _id: 1,
      imageUrl: 1,
    })
    .then((items) => res.send({ data: items }))
    .catch(next);
};

module.exports.createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;

  Item.create({ name, weather, imageUrl, owner: req.user._id }).then((item) => {
    Item.findById(item._id)
      .populate("owner", {
        name: 1,
        _id: 1,
        imageUrl: 1,
      })
      .then((returnItem) => res.send({ data: returnItem }))
      .catch(next);
  });
};

module.exports.deleteItem = (req, res, next) => {
  const requestingUser = req.user._id;

  Item.findById(req.params.id)
    .orFail(() => {
      next(new NotFoundError(itemNotFoundMessage));
    })
    .then((item) => {
      const itemOwner = mongoose.Types.ObjectId(item.owner).toString();

      if (requestingUser === itemOwner) {
        return Item.findByIdAndDelete({
          _id: req.params.id,
        })
          .populate("owner", { name: 1, _id: 1, avatar: 1 })
          .then((returnItem) => res.send({ data: returnItem }));
      }

      return Promise.reject(new ForbiddenError(forbiddenErrorMessage));
    })
    .catch(next);
};

module.exports.likeItem = (req, res, next) => {
  Item.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail(() => {
      next(new NotFoundError(userNotFoundMessage));
    })
    .populate("owner", { name: 1, _id: 1, avatar: 1 })
    .then((item) => res.send({ data: item }))
    .catch(next);
};

module.exports.dislikeItem = (req, res, next) => {
  Item.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail(() => {
      next(new NotFoundError(userNotFoundMessage));
    })
    .populate("owner", { name: 1, _id: 1, avatar: 1 })
    .then((item) => res.send({ data: item }))
    .catch(next);
};
