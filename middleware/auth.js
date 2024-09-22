const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");

module.exports.auth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    const error = new Error();
    error.name = "Unauthorized";
    return next(error);
  }

  const token = authorization.replace("Bearer ", "");
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    err.name = "Unauthorized";
    return next(err);
  }
};
