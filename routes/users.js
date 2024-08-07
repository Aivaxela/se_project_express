const router = require("express").Router();
const { createUser, login } = require("../controllers/users");
const auth = require("../middleware/auth");

router.post("/signin", login);
router.post("/signup", createUser);

module.exports = router;
