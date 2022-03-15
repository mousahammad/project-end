const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://dogProject:dogProject@cluster0.dwrqu.mongodb.net/dogProject?retryWrites=true&w=majority"
  )
  .then(() => console.log("connect to mongoDb endProject"))
  .catch(() => console.log("could not connect to mongoDb"));
