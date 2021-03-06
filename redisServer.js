const redis = require("redis");
const REDIS_PORT = process.env.PORT || 6379;

const client = redis.createClient();

client.on("connect", async () => {
  console.log("Client connected to redis ...");
});

client.on("end", () => {
  console.log("Client is disconnected ...");
});

module.exports = client;
