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
const fs = require("fs");

//save image in database

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

//delete image from server
userRoute.put("/deleteImage/:path", async (req, res) => {
  try {
    if (!req.params.path) {
      res.status(404).send("לא נשלח נתיב תקין");
      return;
    }

    try {
      fs.statSync(`./public/images/${req.params.path}.jpg`);
      fs.unlink(`./public/images/${req.params.path}.jpg`, (err) => {
        if (err) {
          res.status(404).send("תקלה לא נמחקה תמונה");
          return;
        }
      });
    } catch (e) {}

    let user = await UserTable.updateOne(
      { _id: req.params.path },
      { image: false }
    );

    res.status(200).send("התמונה נמחקה בהצלחה");
  } catch (err) {
    res.status(400).send("תקלה פנימית נסה שוב");
  }
});

//update online user
userRoute.put("/updateOnline", authM, async (req, res) => {
  try {
    await UserTable.updateOne({ _id: req.user._id }, { onLine: true });
    res.status(200).send("עודכן");
  } catch (err) {
    res.status(400).send("תקלה פנימית נסה שוב");
  }
});

//update offline user
userRoute.put("/updateOffline", authM, async (req, res) => {
  try {
    await UserTable.updateOne({ _id: req.user._id }, { onLine: false });
    res.status(200).send("עודכן");
  } catch (err) {
    res.status(400).send("תקלה פנימית נסה שוב");
  }
});

//get static online
userRoute.get("/statusOnlineOffline", authM, async (req, res) => {
  try {
    let users = await UserTable.find({});
    let onLine = await UserTable.find({ onLine: true });

    res
      .status(200)
      .send({ numberUser: users.length, numberOnline: onLine.length });
  } catch (err) {
    res.status(400).send("תקלה פנימית נסה שוב");
  }
});

//get status online
userRoute.get("/getStatusOnline", authM, async (req, res) => {
  try {
    let user = await UserTable.findOne({ _id: req.user._id });

    res.status(200).send(user.onLine);
  } catch (err) {
    res.status(400).send("תקלה פנימית נסה שוב");
  }
});

//get all users online
userRoute.get("/getUsersOnline", authM, async (req, res) => {
  try {
    let users = await UserTable.find({ onLine: true }).select("-password");

    if (users.length === 0) {
      res.status(400).send("אין משתמשים מחוברים");
      return;
    }

    res.status(200).send(users);
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
    res.status(404).send("אין משתמש כזה");
  }
});

//get all users in the database.

userRoute.get("/", authM, async (req, res) => {
  try {
    let usersInfo = [];
    let users = await UserTable.find({}).select("-password");

    if (users.length === 0) {
      res.status(404).send("אין משתמשים במערכת");
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
      res.status(400).send("המשתמש קיים במערכת");
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

    const subject = "איפוס סיסמה ";
    const link = `http://localhost:3001/reset-password/${user._id}/${token}`;
    const mail = { userId: user._id, token: token };
    const html = generateTemplate(mail).resetPassword;

    const response = await mailReq(user.email, subject, link, html);
    return res.send(response);
  } catch (error) {
    return res.status(500).send(`Opss... An error occurred: ${error.message}`);
  }
});

//send mail contact us

userRoute.post("/contactUs", async (req, res) => {
  try {
    const { error } = validateEmail({ email: req.body.email });
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    const subject = "צור קשר";
    const link = `http://localhost:3001/contactUs`;
    const mail = {
      fullName: req.body.fullName,
      email: req.body.email,
      content: req.body.content,
    };
    const html = generateTemplate(mail).contactUs;

    const response = await mailReq(config.get("email"), subject, link, html);
    return res.send(response);
  } catch (error) {
    return res.status(500).send(`Opss... An error occurred: ${error.message}`);
  }
});

//update current user
userRoute.put("/:id", authM, async (req, res) => {
  try {
    let updateId = "";

    if (req.user.admin && req.user._id !== req.params.id) {
      updateId = req.params.id;
    } else {
      updateId = req.user._id;
    }

    let user = await UserTable.findOne({ _id: updateId });
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
      let card = await CardTrain.find({ user_id: updateId });

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
      let card = await CardWalker.find({ user_id: updateId });
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
      { _id: updateId },
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

    user = await UserTable.findOne({ _id: req.user._id });

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

module.exports = userRoute;
