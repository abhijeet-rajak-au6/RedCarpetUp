const request = require("supertest");
const { sign } = require("jsonwebtoken");
const User = require("../../../models/User");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

let server;

describe("test for authorization", () => {
  let user;
  let validUserAgent;
  let validUserAdmin;
  beforeEach(async () => {
    server = require("../../../server");

    user = await User.create({
      name: "avi",
      email: "a@gmail.com",
      password: "avirajak1$",
      roles: "customer",
    });

    validUserAgent = await User.create({
      name: "user agent",
      email: "agent@gmail.com",
      password: "brajak1$",
      roles: "agent",
    });
    console.log(validUserAgent);

    validUserAdmin = await User.create({
      name: "admin user",
      email: "admin@gmail.com",
      password: "adminrajak1$",
      roles: "admin",
    });
  });
  afterEach(async () => {
    const del = await User.remove({
      email: { $in: ["a@gmail.com", "agent@gmail.com", "admin@gmail.com"] },
    });
    server.close();
  });
  it("check for invalid valid user permission", async () => {
    let token = sign({ id: user._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });
    const res = await request(server)
      .get("/api/v1/user/list-all-user")
      .set("Authorization", token);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty(
      "message",
      "You are not authorized for this action !"
    );
  });

  it("check for valid user permission", async () => {
    let agentToken = sign({ id: validUserAgent._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });
    let adminToken = sign({ id: validUserAdmin._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });
    const agentRes = await request(server)
      .get("/api/v1/user/list-all-user")
      .set("Authorization", agentToken);

    const adminRes = await request(server)
      .get("/api/v1/user/list-all-user")
      .set("Authorization", adminToken);

    expect(agentRes.status).toBe(200);
    expect(adminRes.status).toBe(200);

    agentRes.body.users.map((u) => {
      expect(agentRes.body).toHaveProperty("message", "List of users");
      expect(u).toHaveProperty("name");
      expect(u).toHaveProperty("email");
      expect(u).not.toHaveProperty("password");
      expect(u).toHaveProperty("_id");
    });

    adminRes.body.users.map((u) => {
      expect(agentRes.body).toHaveProperty("message", "List of users");
      expect(u).toHaveProperty("name");
      expect(u).toHaveProperty("email");
      expect(u).not.toHaveProperty("password");
      expect(u).toHaveProperty("_id");
    });
  });
});
