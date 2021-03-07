const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const userRoutes = require("./Routes/userRoutes");
const loanRoutes = require("./Routes/loanRoute");
dotenv.config();
require("./db");
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(userRoutes);
app.use(loanRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

app.use((error, req, res, next) => {
  if (error.message.includes("user validation failed"))
    error.message = error.message.slice(error.message.indexOf(":"));

  // console.log(error.message);
  return res.status(error.statusCode || 500).send({
    message: error.message,
  });
});

const PORT = process.env.PORT || 1234;

const server = app.listen(PORT, () => {
  // console.log(path.resolve(__dirname,"F.E","build","index.html"));

  console.log("Server is running at port " + PORT);
});

module.exports = server;
