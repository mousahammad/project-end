const mongoose = require("mongoose");
const Joi = require("joi");
const _ = require("lodash");

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

  user_id: { type: mongoose.Types.ObjectId, ref: "User" },
});

let CardTrain = mongoose.model("Card", schemaCard, "cards");

function validateCard(card) {
  let schema = Joi.object({
    experience: Joi.number().min(1).max(99).required(),
    trainWay: Joi.boolean().required(),
    cost: Joi.string().min(2).max(400).required(),
    timeTrain: Joi.number().required(),
  });

  return schema.validate(card);
}

function validateTagsArray(arr) {
  let Shcema = Joi.object({
    tags: Joi.array().min(1).max(3).required(),
  });

  return Shcema.validate(arr);
}

module.exports = {
  CardTrain,
  validateCard,
  validateTagsArray,
};
