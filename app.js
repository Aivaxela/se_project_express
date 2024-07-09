const express = require("express");
const mongoose = require("mongoose");

// mongoose.connect("mongodb://127.0.0.1:27017/wtwr_db");

const { PORT = 3001 } = process.env;
const app = express();

app.listen(PORT);
