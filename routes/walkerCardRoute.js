const cardWalkerRoute = require("express").Router();
const { UserTable, validateUser } = require("../Models/userModel");
const {
  CardWalker,
  validateCardW,
  validateTagsArrayW,
} = require("../Models/walkerCard");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const authM = require("../middleWare/authM");

cardWalkerRoute.post("/", authM, async (req, res) => {
  if (!req.user.dogWalker) {
    res.status(400).send("unauthorized : you are not a walkerDog");
    return;
  }

  let cardW = await CardWalker.findOne({ user_id: req.user._id });

  if (cardW) {
    res.status(400).send("you have already cardWalker ");
    return;
  }

  const { error } = validateCardW(req.body);

  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  let card = new CardWalker({
    ...req.body,
    user_id: req.user._id,
  });

  card = await card.save();
  res.send(card);
});

cardWalkerRoute.put("/:id", authM, async (req, res) => {
  try {
    // let card = await CardTrain.findOne({ _id: req.params.id, user_id: req.user._id });
    // req.body.experience = req.body.experience? req.body.experience : card.experience;
    // req.body.trainWay = req.body.trainWay ? req.body.trainWay : card.trainWay;
    // req.body.cost= req.body.cost ? req.body.cost : card.cost;
    // req.body.timeTrain = req.body.timeTrain ? req.body.timeTrain: card.timeTrain;
    // req.body.bizImage = req.body.bizImage ? req.body.bizImage : card.bizImage;

    const { error } = validateCardW(req.body);

    if (error) {
      res.status(400).json(error.details[0].message);
      return;
    }

    card = await CardWalker.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      req.body
    );
    if (!card) {
      res.status(404).json("the card with given ID was not found");
      return;
    }

    card = await CardWalker.findById(card._id);

    res.json(card);
  } catch (err) {
    res.status(404).json("internal error try again ");
  }
});

module.exports = cardWalkerRoute;
