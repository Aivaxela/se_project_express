const router = require("express").Router();
const { itemNotFound } = require("../utils/errors");
const { createUser, login } = require("../controllers/users");

router.post("/signin", login);
router.post("/signup", createUser);

router.use((req, res) => {
  res.status(itemNotFound).send({ message: "Page not found." });
});

module.exports = router;
