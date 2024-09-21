const router = require("express").Router();
const {
  getItems,
  createItem,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");
const { auth } = require("../middleware/auth");
const { validateNewClothingItem } = require("../middleware/validation");

router.get("/", getItems);
router.post("/", auth, validateNewClothingItem, createItem);
router.delete("/:id", auth, deleteItem);
router.put("/:id/likes", auth, likeItem);
router.delete("/:id/likes", auth, dislikeItem);

module.exports = router;
