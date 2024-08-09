const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

mongoose.connect("mongodb://127.0.0.1:27017/wtwr_db");

const { PORT = 3001 } = process.env;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/users", require("./routes/users"));
app.use("/items", require("./routes/clothingItems"));
app.use("/", require("./routes/index"));
app.use(require("./routes/index"));

app.listen(PORT);
