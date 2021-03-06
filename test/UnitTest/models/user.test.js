const User = require("../../../models/User");
const { verify } = require("jsonwebtoken");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();

describe("should generate jwt token", () => {
  it("should return a valid JSON web token", async () => {
    const user = new User({
      _id: new mongoose.Types.ObjectId().toHexString(),
      name: "Abhijeet",
      email: "abhijeet@gmail.com",
    });
    await user.generateToken();
    const decoded = verify(user.token, process.env.PRIVATE_KEY);
    expect(decoded).toHaveProperty("id", user._id.toHexString());
    expect(decoded).toHaveProperty("iat");
    expect(decoded).toHaveProperty("exp");
  });
});
