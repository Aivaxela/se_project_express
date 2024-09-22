const router = require("express").Router();
const {
  getItems,
  createItem,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");
const { auth } = require("../middleware/auth");
const {
  validateId,
  validateNewClothingItem,
} = require("../middleware/validation");

router.get("/", getItems);
router.post("/", auth, validateNewClothingItem, createItem);
router.delete("/:id", auth, validateId, deleteItem);
router.put("/:id/likes", auth, validateId, likeItem);
router.delete("/:id/likes", auth, validateId, dislikeItem);

module.exports = router;
