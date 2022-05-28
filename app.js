const express = require("express");
const app = express();
require("./db/db");
const userRoute = require("./routes/userRoute");
const authRoute = require("./routes/authRoute");
const cardTrainRoute = require("./routes/trainerCardRoute");
const cardWalkerRoute = require("./routes/walkerCardRoute");
const http = require("http");
const cors = require("cors");
const { mySoket } = require("./db/soket");
const { Server } = require("socket.io");

app.use(cors());

require("./services/createAdmin");
const server = http.createServer(app);
const io = mySoket(server);

// io.on("connection", (socket) => {
//   console.log(`User connected :${socket.id}`);

//   socket.on("join_room", (data) => {
//     socket.join(data);
//     console.log(`User with Id :${socket.id} joined room :${data} `);
//   });

//   socket.on("send_message", (data) => {
//     socket.to(data.room).emit("receive_message", data);
//   });

//   socket.on("disconnect", () => {
//     console.log("User Disconnected", socket.id);
//   });
// });

app.use(express.json(), express.urlencoded({ extended: false }));
app.use(express.static("public/images"));

app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/cardTrain", cardTrainRoute);
app.use("/api/cardWalk", cardWalkerRoute);

const PORT = 3001;
server.listen(PORT, () => {
  console.log("server is listning at port :", PORT);
});
