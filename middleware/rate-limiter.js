const { rateLimit } = require("express-rate-limit");
const RateLimitExceeded = require("../errors/rate-limit-exceeded");
const {
  rateLimitReachedMessage,
} = require("../utils/errors-messages-statuses");

function handleLimitReached() {
  throw new RateLimitExceeded(rateLimitReachedMessage);
}

module.exports.limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: handleLimitReached,
});
