const authRoute = require("express").Router();
const Joi = require("joi");
const { UserTable } = require("../Models/userModel");
const bcrypt = require("bcrypt");

//log in
authRoute.post("/", async (req, res) => {
  const { error } = validateAut(req.body);

  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  try {
    let user = await UserTable.findOne({ email: req.body.email });

    if (!user) {
      res.status(400).send("Invalid email or password");
      return;
    }

    let validPass = await bcrypt.compare(req.body.password, user.password);

    if (!validPass) {
      res.status(400).send("Invalid email or password");
      return;
    }

    res.json({
      token: user.generateAutToken(),
    });
  } catch (error) {
    res.status(404).send("error in db");
  }
});

function validateAut(data) {
  const schema = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required(),
  });

  return schema.validate(data);
}

module.exports = authRoute;
