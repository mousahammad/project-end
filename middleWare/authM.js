const jwt = require("jsonwebtoken");
const config = require("config");

function authM(req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    res.status(400).send("Access Denied");
    return;
  }

  try {
    const decoded = jwt.verify(token, config.get("token"));
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).send("Invalid token");
  }
}

module.exports = authM;
