const router = require("express").Router();
const { itemNotFound } = require("../utils/errors");

router.use((req, res) => {
  res.status(itemNotFound).send({ message: "Page not found." });
});

module.exports = router;
