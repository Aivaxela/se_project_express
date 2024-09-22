const { rateLimit } = require("express-rate-limit");
const {
  rateLimitReachedMessage,
} = require("../utils/errors-messages-statuses");
const RateLimitExceeded = require("../errors/rate-limit-exceeded");

const handleLimitReached = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin");
  throw new RateLimitExceeded(rateLimitReachedMessage);
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  handler: handleLimitReached,
});

module.exports = { limiter };
