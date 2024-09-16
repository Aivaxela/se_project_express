const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");

module.exports.auth = (req, res, next) => {
  let { authorization } = req.headers;
  authorization = authorization.replace("Bearer ", "");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    const error = new Error();
    error.name = "Unauthorized";
    next(error);
  }

  const token = authorization.replace("Bearer ", "");
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    next(err);
  }
};
