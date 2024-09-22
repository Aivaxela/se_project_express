require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// const helmet = require("helmet");
const { limiter } = require("./middleware/limiter");
const { errors } = require("celebrate");
const { errorHandler, errorSender } = require("./middleware/error-handler");
const { requestLogger, errorLogger } = require("./middleware/logger");

mongoose.connect("mongodb://127.0.0.1:27017/wtwr_db");

const { PORT = 3001 } = process.env;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// app.use(helmet());
app.use(limiter);

app.use(requestLogger);

// TODO: remove after review passes
app.get("/crash-test", () => {
  setTimeout(() => {
    throw new Error("Server will crash now");
  }, 0);
});

app.use("/users", require("./routes/users"));
app.use("/items", require("./routes/clothingItems"));
app.use("/", require("./routes/index"));

app.use(errorLogger);
app.use(errors());
app.use(errorHandler, errorSender);

app.listen(PORT);
