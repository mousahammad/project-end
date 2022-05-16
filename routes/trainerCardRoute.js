const cardTrainRoute = require("express").Router();
const {
  UserTable,
  validateUser,
  validateTrainerArray,
} = require("../Models/userModel");
const {
  CardTrain,
  validateCardT,
  validateTagsArrayT,
} = require("../Models/trainerCard");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const authM = require("../middleWare/authM");

//return all favorite card trainer for current user.
cardTrainRoute.get("/getAllFavoriteTrainer", authM, async (req, res) => {
  try {
    let favorite = await UserTable.findById(req.user._id);

    let cards = [];

    for (let i = 0; i < favorite.fDogTrainer.length; i++) {
      let card = await CardTrain.findById(favorite.fDogTrainer[i]);
      let user = await UserTable.findById(card.user_id).select("-password");
      cards.push({ card: card, user: user });
    }

    res.status(200).send(cards);
  } catch (err) {}
});

//return card by id

cardTrainRoute.get("/:id", authM, async (req, res) => {
  try {
    let card = await CardTrain.find({ _id: req.params.id });

    if (!card) {
      res.status(404).send("no card with given id");
      return;
    }

    res.send(card);
  } catch (err) {
    res.status(404).send("no card with given id");
  }
});

//get card by given user Id

cardTrainRoute.get("/byUser/:id", authM, async (req, res) => {
  try {
    let card = await CardTrain.find({ user_id: req.params.id });

    if (card.length == 0) {
      res.status(400).send("no card with given user id");
      return;
    }

    res.send(card[0]);
  } catch (err) {
    res.status(404).send("no data");
  }
});

//return all the cards

cardTrainRoute.get("/", authM, async (req, res) => {
  try {
    let cards = await CardTrain.find({});

    if (!cards) {
      res.status(404).send("no cards yet");
      return;
    }

    res.send(cards);
  } catch (err) {
    res.status(404).send("no cards yet");
  }
});

//add favorite card to user array

cardTrainRoute.patch("/addT", authM, async (req, res) => {
  try {
    const { error } = validateTrainerArray(req.body);

    if (error) {
      res.status(400).send(error.data[0].message);
      return;
    }

    let user = await UserTable.updateOne(
      { _id: req.user._id },
      { $addToSet: { fDogTrainer: { $each: req.body.fDogTrainer } } }
    );

    user = await UserTable.findById(req.user._id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).send("internal error");
  }
});

//delete favorite card from the user array ,the function recive array of cards and delete them

cardTrainRoute.patch("/deleteT", authM, async (req, res) => {
  try {
    let user = await UserTable.updateOne(
      { _id: req.user._id },
      { $pull: { fDogTrainer: { $in: req.body.fDogTrainer } } }
    );
    user = await UserTable.findById(req.user._id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).send("internal error");
  }
});

//check if th card exists in the array favorite

cardTrainRoute.get("/checkFvCard/:idCard", authM, async (req, res) => {
  try {
    let idCard = req.params.idCard;

    if (!idCard) {
      res.status(400).send("מספר הכרטיס ריק תנסה שוב");
      return;
    }

    let card = await UserTable.find({ fDogTrainer: idCard });

    if (card.length == 0) {
      res.status(200).send(false);
      return;
    }

    res.status(200).send(true);
  } catch (err) {
    res.status(404).send("internal error");
  }
});

//create new card .
cardTrainRoute.post("/", authM, async (req, res) => {
  try {
    if (!req.user.dogTrainer) {
      res.status(400).send("unauthorized : you are not a trainer");
      return;
    }

    let cardT = await CardTrain.findOne({ user_id: req.user._id });

    if (cardT) {
      res.status(400).send("you have already cardTrainer ");
      return;
    }

    const data = _.omit(req.body, ["meets", "tags"]);
    const { error } = validateCardT(data);

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
  } catch (err) {
    res.status(404).send("the card was not created");
  }
});

//update card by idCard.

cardTrainRoute.put("/:id", authM, async (req, res) => {
  try {
    const data = _.omit(req.body, ["meets", "tags"]);
    const { error } = validateCardT(data);

    if (error) {
      res.status(400).json(error.details[0].message);
      return;
    }

    let card = null;

    if (req.user.admin) {
      card = await CardTrain.findOneAndUpdate({ _id: req.params.id }, req.body);
    } else {
      card = await CardTrain.findOneAndUpdate(
        { _id: req.params.id, user_id: req.user._id },
        req.body
      );
    }

    if (!card) {
      res
        .status(404)
        .json("the card with given ID was not found or havnt Permissions");
      return;
    }

    card = await CardTrain.findById(card._id);

    res.json(card);
  } catch (err) {
    res.status(404).json("internal error try again ");
  }
});

//delete card by id

cardTrainRoute.delete("/:id", authM, async (req, res) => {
  try {
    let card = null;

    if (req.user.admin) {
      card = await CardTrain.findOneAndRemove({
        _id: req.params.id,
      });
    } else {
      card = await CardTrain.findOneAndRemove({
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
      { $pull: { fDogTrainer: myId } }
    );

    res.json("the card was deleted");
  } catch (err) {
    res.status(404).json("internal error try again ");
  }
});

cardTrainRoute.post("/updateMeet/:cardId", authM, async (req, res) => {
  try {
    let data = req.body;

    if (!data) {
      res.status(400).send("אין נתונים");
      return;
    }

    console.log(data);
    let user = await CardTrain.updateOne(
      { _id: req.params.cardId },
      { $set: { meets: data } }
    );

    res.send(user);
  } catch (err) {
    res.status(404).send("תקלה בשמירת הנתונים");
  }
});

module.exports = cardTrainRoute;
