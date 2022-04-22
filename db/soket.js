const { Server } = require("socket.io");
const cors = require("cors");

const mySoket = (server) => {
  return new Server(server, {
    cors: {
      origin: "http://localhost:3000",
    },
  });
};

module.exports = { mySoket };
