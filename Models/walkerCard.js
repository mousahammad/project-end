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

  cost: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 400,
  },
  timeWalker: {
    type: Number,
    required: true,
  },
  tags: Array,

  user_id: { type: mongoose.Types.ObjectId, ref: "User" },
});

let CardWalker = mongoose.model("CardWalker", schemaCard, "cardsWalker");

function validateCardW(card) {
  let schema = Joi.object({
    experience: Joi.number().min(1).max(99).required(),
    cost: Joi.string().min(2).max(400).required(),
    timeWalker: Joi.number().required(),
  });

  return schema.validate(card);
}

function validateTagsArrayW(arr) {
  let Shcema = Joi.object({
    tags: Joi.array().min(1).max(3).required(),
  });

  return Shcema.validate(arr);
}

module.exports = {
  CardWalker,
  validateCardW,
  validateTagsArrayW,
};
