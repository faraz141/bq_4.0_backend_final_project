const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.MongoURI)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.log("Database connection failed", err);
  });

module.exports = mongoose;
