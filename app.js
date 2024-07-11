const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(console.log("connected to DB"))
  .catch(console.error);

const { PORT = 3001 } = process.env;
const app = express();

//
//
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((err, req, res, next) => {
  if (err) {
    console.error(err);
    return res
      .status(400)
      .send({ message: `Error in JSON body: ${err.message}` });
  }
  next();
});

//temporary user id for clothing item creation
app.use((req, res, next) => {
  req.user = {
    _id: "668e0f9ce4c683c6da3b8d44",
  };
  next();
});

app.use("/users", require("./routes/users"));
app.use("/items", require("./routes/clothingItems"));

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT);
