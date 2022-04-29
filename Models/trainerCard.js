const mongoose = require("mongoose");
const Joi = require("joi");
const _ = require("lodash");

//schema fro trainer card
let schemaCard = mongoose.Schema({
  experience: {
    type: Number,
    required: true,
    minlength: 1,
    maxlength: 99,
  },
  trainWay: {
    type: Boolean,
    required: true,
  },
  cost: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 400,
  },
  timeTrain: {
    type: Number,
    required: true,
  },
  tags: Array,
  meets: {
    sun: Array,
    mon: Array,
    tues: Array,
    wen: Array,
    turs: Array,
    fri: Array,
    sat: Array,
  },

  user_id: { type: mongoose.Types.ObjectId, ref: "User" },
});

let CardTrain = mongoose.model("CardTrainer", schemaCard, "cardsTrainer");

//validtion

function validateCardT(card) {
  let schema = Joi.object({
    experience: Joi.number().min(1).max(99).required(),
    trainWay: Joi.boolean().required(),
    cost: Joi.string().min(2).max(400).required(),
    timeTrain: Joi.number().required(),
  });

  return schema.validate(card);
}

//validation for tags array

function validateTagsArrayT(arr) {
  let Shcema = Joi.object({
    tags: Joi.array().min(1).max(3).required(),
  });

  return Shcema.validate(arr);
}

module.exports = {
  CardTrain,
  validateCardT,
  validateTagsArrayT,
};
