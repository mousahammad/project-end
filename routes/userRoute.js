const userRoute = require("express").Router();
const {
  UserTable,
  validateUser,
  validateEmail,
} = require("../Models/userModel");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const authM = require("../middleWare/authM");
const config = require("config");
const jwt = require("jsonwebtoken");
const { mailReq } = require("../services/mailReq");
const { generateTemplate } = require("../services/generateTemplate");
const { CardTrain } = require("../Models/trainerCard");
const { CardWalker } = require("../Models/walkerCard");
const { upload } = require("../services/upload");
const { AwsClient } = require("google-auth-library");

userRoute.post("/saveImage", async (req, res) => {
  try {
    upload(req, res, (err) => {
      if (err) {
        res.sendStatus(500);
      }
    });

    res.status(200).send("התמונה עלתה");
  } catch (err) {
    res.status(400).send("תקלה פנימית נסה שוב");
  }
});

//get information about connect user

userRoute.get("/me", authM, async (req, res) => {
  try {
    let user = await UserTable.findOne({ _id: req.user._id }).select(
      "-password"
    );
    if (!user) {
      res.status(400).send("המשתמש לא קיים במערכת יותר");
      return;
    }
    res.send(user);
  } catch (err) {
    res.status(404).send("נתונים שגוים");
  }
});

//get user by id

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

//get all users in the database.

userRoute.get("/", authM, async (req, res) => {
  try {
    let usersInfo = [];
    let users = await UserTable.find({}).select("-password");

    if (users.length === 0) {
      res.status(404).send("no users yet");
      return;
    }

    for (let i = 0; i < users.length; i++) {
      let train = await CardTrain.find({ user_id: users[i]._id });
      let walker = await CardWalker.find({ user_id: users[i]._id });

      usersInfo.push({
        user: users[i],
        cardWalker: walker[0],
        cardTrainer: train[0],
      });
    }

    res.status(200).send(usersInfo);
  } catch (err) {
    res.status(404).send("no users yet");
  }
});

//sign up new user

userRoute.post("/", async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).send("error on save data");
  }
});

//update current user
userRoute.put("/:id", authM, async (req, res) => {
  try {
    let user = await UserTable.findOne({ _id: req.params.id });
    req.body.password = user.password;
    req.body.image = req.body.image ? req.body.image : user.image;
    const { error } = validateUser(req.body);
    if (error) {
      res.status(400).send(error.details[0].message);
      return;
    }

    if (req.body.email !== user.email) {
      let newEmail = await UserTable.find({ email: req.body.email });

      if (newEmail.length) {
        res.status(400).send("האימייל הזה כבר רשום במערכת");
        return;
      }
    }

    if (!req.body.dogTrainer) {
      let card = await CardTrain.find({ user_id: req.params.id });

      if (card.length) {
        res
          .status(400)
          .send(
            "לא ניתן לעדכן דוג-טרינר מכיוון שקיים לך כרטיס של דוג טרינר .ניתן למחוק הכרטיס ואז לנסות שוב"
          );
        return;
      }
    }

    if (!req.body.dogWalker) {
      let card = await CardWalker.find({ user_id: req.params.id });
      if (card.length) {
        res
          .status(400)
          .send(
            "לא ניתן לעדכן דוג-ווקר מכיוון שקיים לך כרטיס של דוג ווקר .ניתן למחק הכרטיס ואז לנסות שוב"
          );
        return;
      }
    }

    user = await UserTable.updateOne(
      { _id: req.params.id },
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        city: req.body.city,
        admin: req.body.admin,
        gender: req.body.gender,
        dateBirthDay: req.body.dateBirthDay,
        dogTrainer: req.body.dogTrainer,
        dogWalker: req.body.dogWalker,
        phone: req.body.phone,
        image: req.body.image,
      }
    );

    user = await UserTable.findOne({ _id: req.params.id });

    const token = user.generateAutToken();
    user = _.pick(user, [
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
    ]);

    res.send({ user, token });
  } catch (err) {
    res.status(404).send("error on save data");
  }
});

//reset password after we recive the link from the email

userRoute.put("/reset-password", async (req, res) => {
  try {
    const { _id, tokenRef, password } = req.body;
    const decoded = jwt.verify(tokenRef, config.get("token"));

    let user = await UserTable.findOne({ _id: decoded._id });
    if (!user) return res.status(400).send("לא נמצא המשתמש במאגר");

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);
    user = await UserTable.updateOne({ _id }, { password: user.password });
    res.status(200).send("הסיסמה עודכנה בהצלחה");
  } catch (err) {
    res.status(400).send("תקלה בעדכון סיסמה");
  }
});

//send mail to the user in order  to reset password

userRoute.post("/forgot-password", async (req, res) => {
  try {
    const { error } = validateEmail(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    const { email } = req.body;

    let user = await UserTable.findOne({ email });
    if (!user)
      return res
        .status(400)
        .send("לא נמצא המשתמש עם כתובת המייל הזאת במאגר המידע");

    const secret = config.get("token");
    const token = jwt.sign(
      {
        _id: user._id,
        admin: user.admin,
        dogTrainer: user.dogTrainer,
        dogWalker: user.dogWalker,
      },
      secret,
      {
        expiresIn: "15m",
      }
    );

    const subject = "Project-Dog password reset;";
    const link = `http://localhost:3001/reset-password/${user._id}/${token}`;
    const mail = { userId: user._id, token: token };
    const html = generateTemplate(mail).resetPassword;

    const response = await mailReq(user.email, subject, link, html);
    return res.send(response);
  } catch (error) {
    return res.status(500).send(`Opss... An error occurred: ${error.message}`);
  }
});

module.exports = userRoute;
