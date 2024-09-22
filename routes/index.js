const router = require("express").Router();
const { createUser, login } = require("../controllers/users");
const {
  validateNewUser,
  validateUserLogin,
} = require("../middleware/validation");
const NotFoundError = require("../errors/not-found");
const { pageNotFoundMessage } = require("../utils/errors-messages-statuses");

router.post("/signin", validateUserLogin, login);
router.post("/signup", validateNewUser, createUser);

router.use(() => {
  throw new NotFoundError(pageNotFoundMessage);
});

module.exports = router;
