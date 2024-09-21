const router = require("express").Router();
const { getCurrentUser, updateProfile } = require("../controllers/users");
const { auth } = require("../middleware/auth");
const {
  validateId,
  validateUserInfoOnUpdate,
} = require("../middleware/validation");

router.get("/me", auth, validateId, getCurrentUser);
router.patch("/me", auth, validateUserInfoOnUpdate, updateProfile);

module.exports = router;
