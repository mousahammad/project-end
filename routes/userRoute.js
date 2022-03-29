const userRoute = require("express").Router();
const { UserTable, validateUser } = require("../Models/userModel");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const authM = require("../middleWare/authM");
const config = require("config");
const jwt = require("jsonwebtoken");

userRoute.get("/me", authM, async (req, res) => {
  let user = await UserTable.findOne({ _id: req.user._id }).select("-password");
  res.send(user);
});

userRoute.get("/:id", authM, async (req, res) => {
  try {
    let user = await UserTable.find({ _id: req.params.id }).select("-password");

    if (!user) {
      res.status(404).send("no user with given id");
      return;
    }

    res.send(user);
  } catch (err) {
    res.status(404).send("no user with given id");
  }
});

userRoute.get("/", authM, async (req, res) => {
  try {
    let users = await UserTable.find({}).select("-password");

    if (!users) {
      res.status(404).send("no users yet");
      return;
    }

    res.send(users);
  } catch (err) {
    res.status(404).send("no users yet");
  }
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

// userRoute.post("/forgot-password", async (req, res) => {
//   // const { error } = validateEmail(req.body);
//   // if (error) {
//   //   console.error(chalk.redBright(error.message));
//   //   return res.status(400).send(error.details[0].message);
//   // }

//   const { email } = req.body;
//   try {
//     let user = await UserTable.findOne({ email: e });
//     if (!user)
//       return res
//         .status(400)
//         .send("לא נמצא המשתמש עם כתובת המייל הזאת במאגר המידע");

//     const secret = config.get("token") + user.password;
//     const token = jwt.sign({ _id: user._id, email: user.email }, secret, {
//       expiresIn: "15m",
//     });

//     const subject = "anu-architects password reset";
//     const link = `http://localhost:3001/private-area/reset-password/${user._id}/${token}`;
//     const mail = { userId: user._id, token: token };
//     const html = generateTemplate(mail).resetPassword;

//     const response = await mailReq(user.email, subject, link, html);
//     return res.send(response);
//   } catch (error) {
//     //console.error(chalk.redBright(error.message));
//     return res.status(500).send(`Opss... An error occurred: ${error.message}`);
//   }
// });

module.exports = userRoute;
