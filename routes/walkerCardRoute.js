const cardWalkerRoute = require("express").Router();
const {
  UserTable,
  validateUser,
  validateWalkerArray,
} = require("../Models/userModel");
const {
  CardWalker,
  validateCardW,
  validateTagsArrayW,
} = require("../Models/walkerCard");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const authM = require("../middleWare/authM");

//get card by given user Id

cardWalkerRoute.get("/byUser/:id", authM, async (req, res) => {
  try {
    let card = await CardWalker.find({ user_id: req.params.id });

    if (card.length == 0) {
      res.status(400).send("no card with given user id");
      return;
    }

    res.send(card[0]);
  } catch (err) {
    res.status(404).send("no data");
  }
});

//get card by given id

cardWalkerRoute.get("/:id", authM, async (req, res) => {
  try {
    let card = await CardWalker.find({ _id: req.params.id });

    if (!card) {
      res.status(404).send("no card with given id");
      return;
    }

    res.send(card);
  } catch (err) {
    res.status(404).send("no card with given id");
  }
});

//get all cards in dataBase

cardWalkerRoute.get("/", authM, async (req, res) => {
  try {
    let cards = await CardWalker.find({});

    if (!cards) {
      res.status(404).send("no cards yet");
      return;
    }

    res.send(cards);
  } catch (err) {
    res.status(404).send("no cards yet");
  }
});

//add favorite card in user array

cardWalkerRoute.patch("/addW", authM, async (req, res) => {
  try {
    const { error } = validateWalkerArray(req.body);
    if (error) {
      res.status(400).send(error.details[0].message);
      return;
    }

    let user = await UserTable.updateOne(
      { _id: req.user._id },
      { $addToSet: { fDogWalker: { $each: req.body.fDogWalker } } }
    );

    user = await UserTable.findById(req.user._id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).send("internal error");
  }
});

//delete favortie card from user array

cardWalkerRoute.patch("/deleteW", authM, async (req, res) => {
  try {
    let user = await UserTable.updateOne(
      { _id: req.user._id },
      { $pull: { fDogWalker: { $in: req.body.fDogWalker } } }
    );
    user = await UserTable.findById(req.user._id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).send("internal error");
  }
});

//check if th card exists in favorite array

cardWalkerRoute.get("/checkFvCard/:idCard", authM, async (req, res) => {
  try {
    let idCard = req.params.idCard;

    if (!idCard) {
      res.status(400).send("מספר הכרטיס ריק תנסה שוב");
      return;
    }

    let card = await UserTable.find({ fDogWalker: idCard });

    if (card.length == 0) {
      res.status(200).send(false);
      return;
    }

    res.status(200).send(true);
  } catch (err) {
    res.status(404).send("internal error");
  }
});

//create new card

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

  const data = _.omit(req.body, ["meets", "tags"]);

  const { error } = validateCardW(data);

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

//update card by given id
cardWalkerRoute.put("/:id", authM, async (req, res) => {
  try {
    const data = _.omit(req.body, ["meets", "tags"]);
    const { error } = validateCardW(data);

    if (error) {
      res.status(400).json(error.details[0].message);
      return;
    }

    let card = null;

    if (req.user.admin) {
      card = await CardWalker.findOneAndUpdate(
        { _id: req.params.id },
        req.body
      );
    } else {
      card = await CardWalker.findOneAndUpdate(
        { _id: req.params.id, user_id: req.user._id },
        req.body
      );
    }

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

//delete card by given id

cardWalkerRoute.delete("/:id", authM, async (req, res) => {
  try {
    let card = null;

    if (req.user.admin) {
      card = await CardWalker.findOneAndRemove({
        _id: req.params.id,
      });
    } else {
      card = await CardWalker.findOneAndRemove({
        _id: req.params.id,
        user_id: req.user._id,
      });
    }
    if (!card) {
      res.status(404).json("the card with the given Id was not found");
      return;
    }

    let myId = String(card._id);
    const users = await UserTable.updateMany(
      {},
      { $pull: { fDogWalker: myId } }
    );

    res.json("the card was deleted");
  } catch (err) {
    res.status(404).json("internal error try again ");
  }
});

module.exports = cardWalkerRoute;
