const router = require("express").Router();
const { createUser, login } = require("../controllers/users");
const {
  validateNewUser,
  validateUserLogin,
} = require("../middleware/validation");

router.post("/signin", validateUserLogin, login);
router.post("/signup", validateNewUser, createUser);

module.exports = router;
