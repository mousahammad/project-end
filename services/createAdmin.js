const {
  UserTable,
  validateUser,
  validateEmail,
} = require("../Models/userModel");
const bcrypt = require("bcrypt");

const config = require("config");

//create admin when the server on

const createAdmin = async (admin) => {
  try {
    let user = await UserTable.findOne({ email: admin.email });

    if (user) {
      return;
    }

    user = new UserTable(admin);
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
    user = await user.save();
  } catch (err) {
    console.log(err);
  }
};

createAdmin(config.get("admin"));
