let server;

const request = require("supertest");
const User = require("../../../models/User");
const { sign } = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

describe("testing the authorization middleware", () => {
  let user;
  beforeEach(async () => {
    server = require("../../../server");
    user = await User.create({
      name: "Avi",
      email: "avi@gmail.com",
      password: "helloworld",
      roles: "customer",
    });
  });

  afterEach(async () => {
    server.close();
    await User.remove({
      email: { $in: ["avi@gmail.com"] },
    });
  });

  it("return 403 if user is not authorized", async () => {
    let token = sign({ id: user._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });

    const res = await request(server)
      .get("/api/v1/user/list-all-user")
      .set("Authorization", token);

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({
      message: "You are not authorized for this action !",
    });
  });
});
