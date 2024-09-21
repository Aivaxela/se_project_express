const router = require("express").Router();
const { itemNotFound } = require("../utils/errors-messages-statuses");
const { createUser, login } = require("../controllers/users");
const {
  validateNewUser,
  validateUserLogin,
} = require("../middleware/validation");

router.post("/signin", validateUserLogin, login);
router.post("/signup", validateNewUser, createUser);

router.use((req, res) => {
  res.status(itemNotFound).send({ message: "Page not found." });
});

module.exports = router;
