const express = require("express");
const app = express();
require("./db/db");
const userRoute = require("./routes/userRoute");
const authRoute = require("./routes/authRoute");
const cardTrainRoute = require("./routes/trainerCardRoute");
const cardWalkerRoute = require("./routes/walkerCardRoute");
const cors = require("cors");

app.use(cors());
app.use(express.json(), express.urlencoded({ extended: false }));

app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/cardTrain", cardTrainRoute);
app.use("/api/cardWalk", cardWalkerRoute);

const PORT = 3001;
app.listen(PORT, () => {
  console.log("server is listning at port :", PORT);
});
