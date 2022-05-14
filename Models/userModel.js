const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");

//schema for user
let schemaUser = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255,
  },
  lastName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255,
  },
  email: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 255,
    unique: true,
  },
  city: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 400,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 255,
  },
  gender: {
    type: String,
    required: true,
  },
  dateBirthDay: {
    type: Date,
    required: true,
  },
  admin: {
    type: Boolean,
    required: true,
  },
  dogTrainer: {
    type: Boolean,
    required: true,
  },
  dogWalker: {
    type: Boolean,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    minlength: 9,
    maxlength: 10,
  },
  image: {
    type: Boolean,
    required: false,
    minlength: 11,
    maxlength: 1024,
  },

  fDogWalker: Array,
  fDogTrainer: Array,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//create token
schemaUser.methods.generateAutToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      admin: this.admin,
      dogTrainer: this.dogTrainer,
      dogWalker: this.dogWalker,
    },
    config.get("token")
  );
};

//validaton

function validateUser(user) {
  const shcema = Joi.object({
    firstName: Joi.string().min(2).max(255).required(),
    lastName: Joi.string().min(2).max(255).required(),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required(),
    city: Joi.string().min(2).max(400).required(),
    gender: Joi.string().required(),
    dateBirthDay: Joi.date().required(),
    admin: Joi.boolean().required(),
    dogTrainer: Joi.boolean().required(),
    dogWalker: Joi.boolean().required(),
    phone: Joi.string()
      .min(9)
      .max(10)
      .required()
      .regex(/^0[2-9]\d{7,8}$/),
    image: Joi.boolean(),
  });
  return shcema.validate(user);
}

//validation for favorite array

function validateTrainerArray(arr) {
  let Shcema = Joi.object({
    fDogTrainer: Joi.array().min(1).required(),
  });

  return Shcema.validate(arr);
}

//validation for email

function validateEmail(mail) {
  let Shcema = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
  });

  return Shcema.validate(mail);
}

function validateWalkerArray(arr) {
  let Shcema = Joi.object({
    fDogWalker: Joi.array().min(1).required(),
  });

  return Shcema.validate(arr);
}

const UserTable = mongoose.model("User", schemaUser, "users");
module.exports = {
  UserTable,
  validateUser,
  validateTrainerArray,
  validateWalkerArray,
  validateEmail,
};
