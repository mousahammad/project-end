const userRoute = require("express").Router();
const { UserTable, validateUser } = require("../Models/userModel");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const authM = require("../middleWare/authM");

userRoute.get("/me", authM, async (req, res) => {
  let user = await UserTable.findOne({ _id: req.user._id }).select("-password");
  res.send(user);
});

userRoute.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  let user = await UserTable.findOne({ email: req.body.email });

  if (user) {
    res.status(400).send("the user is already exists");
    return;
  }

  user = new UserTable(req.body);
  const salt = await bcrypt.genSalt(12);
  user.password = await bcrypt.hash(user.password, salt);
  user = await user.save();

  res.send(
    _.pick(user, [
      "_id",
      "firstName",
      "lastName",
      "email",
      "city",
      "admin",
      "gender",
      "dateBirthDay",
      "dogTrainer",
      "dogWalker",
      "phone",
      "image",
    ])
  );
});

module.exports = userRoute;
