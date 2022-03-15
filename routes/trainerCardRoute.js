const cardTrainRoute = require("express").Router();
const { UserTable, validateUser } = require("../Models/userModel");
const {
  CardTrain,
  validateCard,
  validateTagsArray,
} = require("../Models/trainerCard");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const authM = require("../middleWare/authM");

cardTrainRoute.post("/", authM, async (req, res) => {
  if (!req.user.dogTrainer) {
    res.status(400).send("unauthorized : you are not a trainer");
    return;
  }

  const { error } = validateCard(req.body);

  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  let card = new CardTrain({
    ...req.body,
    user_id: req.user._id,
  });

  card = await card.save();
  res.send(card);
});

module.exports = cardTrainRoute;
