let server;
let redisServer;
const request = require("supertest");
const { sign } = require("jsonwebtoken");
const User = require("../../../models/User");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

describe("/api/v1/register", () => {
  let registerUser;
  beforeEach(async () => {
    server = require("../../../server");
    userRegister = await User.create({
      name: "evi",
      email: "evi@gmail.com",
      password: "evirajak1$",
      roles: "customer",
    });
  });
  afterEach(async () => {
    server.close();
    await User.deleteOne({ email: "abhijeetrajak10@gmail.com" });
    await User.deleteOne({ email: "evi@gmail.com" });
  });

  it("save user if valid payload ", async () => {
    const res = await request(server).post("/api/v1/register").send({
      name: "Abhijeet",
      email: "abhijeetrajak10@gmail.com",
      password: "helloworld",
      roles: "  customer  ",
    });

    let result = await User.findOne({
      email: "abhijeetrajak10@gmail.com",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "user registered sucessfully");
    expect(result).not.toBeNull();
  });

  it("should return 400 if name length <=3 || name is empty", async () => {
    const payload1 = {
      name: "a",
    };

    const res1 = await request(server).post("/api/v1/register").send(payload1);

    expect(res1.status).toBe(400);
    expect(res1.body).toHaveProperty(
      "message",
      "Length of name should be between 3 to 20"
    );

    let res2;
    const emptyValue = [null, undefined, "", "  "];

    res2 = emptyValue.map(async (ev) => {
      const payload2 = {
        name: ev,
      };
      return await request(server).post("/api/v1/register").send(payload2);
    });

    res2 = await Promise.all(res2);

    res2.forEach((r, idx) => {
      expect(r.status).toBe(400);
      expect(r.body).toHaveProperty("message", "please provide name");
    });
  });

  it("should return 400 if email is invalid or empty", async () => {
    const payload1 = {
      name: "hello",
      email: "avi@gmail",
    };

    const res1 = await request(server).post("/api/v1/register").send(payload1);

    expect(res1.status).toBe(400);
    expect(res1.body).toHaveProperty("message", "please provide correct email");

    let res2;
    const emptyValue = [null, undefined, "", "  "];

    res2 = emptyValue.map(async (ev) => {
      const payload2 = {
        name: "hello",
        email: ev,
      };
      return await request(server).post("/api/v1/register").send(payload2);
    });

    res2 = await Promise.all(res2);

    res2.forEach((r, idx) => {
      expect(r.status).toBe(400);
      expect(r.body).toHaveProperty("message", "please provide email");
    });
  });

  it("should return 400 if password is invalid or empty", async () => {
    const payload1 = {
      name: "hello",
      email: "avi@gmail.com",
      password: "aa",
    };

    const res1 = await request(server).post("/api/v1/register").send(payload1);

    expect(res1.status).toBe(400);

    expect(res1.body).toHaveProperty(
      "message",
      "Length of password should be between 8 to 20"
    );

    let res2;
    const emptyValue = [null, undefined, ""];

    res2 = emptyValue.map(async (ev) => {
      const payload2 = {
        name: "hello",
        email: "avi@gmail.com",
        password: ev,
      };
      return await request(server).post("/api/v1/register").send(payload2);
    });

    res2 = await Promise.all(res2);

    res2.forEach((r, idx) => {
      expect(r.status).toBe(400);
      expect(r.body).toHaveProperty("message", "please provide password");
    });
  });

  it("should return 400 if roles is not customer or agent or admin", async () => {
    const payload = {
      name: "avi",
      email: "hello@gmail.com",
      password: "helloworld",
      roles: "Rental",
    };

    const res = await request(server).post("/api/v1/register").send(payload);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "message",
      "role should be either : agent || customer || admin"
    );
  });

  it("should return 403 if email is already registered", async () => {
    const res = await request(server).post("/api/v1/register").send({
      name: "newuser",
      email: "evi@gmail.com",
      password: "password",
      roles: "customer",
    });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("message", "email is already registered");
  });

  it("should trim all spaces in payload", async () => {
    const res = await request(server).post("/api/v1/register").send({
      name: " Abhijeet Rajak ",
      email: " abhijeetrajak10@gmail.com ",
      password: " hell oworld ",
      roles: "  customer  ",
    });

    const user = await User.findOne({
      email: "abhijeetrajak10@gmail.com",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "user registered sucessfully");
    expect(user).toHaveProperty("name", "Abhijeet Rajak");
    expect(user).toHaveProperty("email", "abhijeetrajak10@gmail.com");
    expect(user).toHaveProperty("roles", "customer");
  });
});

describe("/api/v1/login", () => {
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
    await User.deleteOne({ _id: user._id });
  });

  it("should retrun 400 if email is invalid or empty", async () => {
    const payload1 = {
      email: "avi@gmail",
    };

    const res1 = await request(server).post("/api/v1/login").send(payload1);

    expect(res1.status).toBe(400);
    expect(res1.body).toHaveProperty("message", "please provide correct email");

    // check for empty string

    let res2;
    const emptyValue = [null, undefined, "", "   "];

    res2 = emptyValue.map(async (ev) => {
      const payload2 = {
        email: ev,
      };
      return await request(server).post("/api/v1/login").send(payload2);
    });

    res2 = await Promise.all(res2);

    res2.forEach((r, idx) => {
      expect(r.status).toBe(400);
      expect(r.body).toHaveProperty("message", "please provide email");
    });
  });

  it("should return 400 if password is empty or length is less than 8 or length > 20", async () => {
    const payload1 = {
      email: "avi@gmail.com",
      password: "a".repeat(23),
    };

    const payload2 = {
      email: "avi@gmail.com",
      password: "aaa",
    };

    const res1 = await request(server).post("/api/v1/login").send(payload1);
    const res2 = await request(server).post("/api/v1/login").send(payload2);

    expect(res1.status).toBe(400);
    expect(res1.body).toHaveProperty(
      "message",
      "Length of password should be between 8 to 20"
    );

    expect(res2.status).toBe(400);
    expect(res2.body).toHaveProperty(
      "message",
      "Length of password should be between 8 to 20"
    );

    // check empty
    let res3;
    const emptyValue = [null, undefined, ""];

    res3 = emptyValue.map(async (ev) => {
      const payload3 = {
        email: "avi@gmail.com",
        password: ev,
      };
      return await request(server).post("/api/v1/login").send(payload3);
    });

    res3 = await Promise.all(res3);

    res3.forEach((r, idx) => {
      expect(r.status).toBe(400);
      expect(r.body).toHaveProperty("message", "please provide password");
    });
  });

  it("should return 200 if payload is valid", async () => {
    const payload = {
      email: "avi@gmail.com",
      password: "helloworld",
    };
    const res = await request(server).post("/api/v1/login").send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", `Welcome Avi`);
    expect(res.body).toHaveProperty("token");
  });

  it("should return 404 if email and password is incorrect", async () => {
    const payload = {
      email: "a@gmail.com",
      password: "helloworld",
    };

    const res = await request(server).post("/api/v1/login").send(payload);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "Incorrect credentials");
  });

  it("should trim the payload and return sucessful login", async () => {
    const payload = {
      email: " avi@gmail.com ",
      password: "helloworld",
    };
    const res = await request(server).post("/api/v1/login").send(payload);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", `Welcome Avi`);
    expect(res.body).toHaveProperty("token");
  });
});

describe("/api/v1/logout", () => {
  let token;
  let user;
  beforeEach(async () => {
    server = require("../../../server");
    user = await User.create({
      name: "avi",
      email: "avi@gmail.com",
      password: "helloworld",
      roles: "agent",
    });
    token = sign({ id: user._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });
  });

  afterEach(async () => {
    server.close();
    await User.deleteOne({ _id: user._id });
  });

  it("should return 404 if auth token not provided", async () => {
    let token = "";

    const res = await request(server).delete("/api/v1/logout");

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "token not found");
  });
  it("sucessful logout", async () => {
    const res = await request(server)
      .delete("/api/v1/logout")
      .set("Authorization", token);

    expect(res.status).toBe(200);
  });
});

describe("/api/v1/user/list-all-user", () => {
  let userAdmin;
  let userAgent;
  beforeEach(async () => {
    server = require("../../../server");
    userAdmin = await User.create({
      name: "avi",
      email: "Avi@gmail.com",
      password: "helloworld",
      roles: "admin",
    });

    userAgent = await User.create({
      name: "bvi",
      email: "bvi@gmail.com",
      password: "hello",
      roles: "agent",
    });

    userCustomer = await User.create({
      name: "cust",
      email: "cust@gmail.com",
      password: "cust123456",
      roles: "customer",
    });
  });

  afterEach(async () => {
    server.close();
    // await User.remove({});
    await User.deleteOne({ email: "bvi@gmail.com" });
    await User.deleteOne({ email: "Avi@gmail.com" });
    await User.deleteOne({ email: "cust@gmail.com" });
    // User.deleteMany({ email: "bvi@gmail.com", email: "Avi@gmail.com" });
  });

  it("return list of users if user is admin or agent", async () => {
    let tokenAdmin = sign({ id: userAdmin._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });

    let tokenAgent = sign({ id: userAgent._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });
    const resAdmin = await request(server)
      .get("/api/v1/user/list-all-user?page=0&limit=0")
      .set("Authorization", tokenAdmin);

    const resAgent = await request(server)
      .get("/api/v1/user/list-all-user")
      .set("Authorization", tokenAgent);

    expect(resAdmin.status).toBe(200);

    expect(resAgent.status).toBe(200);

    resAdmin.body.users.map((u) => {
      expect(resAdmin.body).toHaveProperty("message", "List of users");
      expect(u).toHaveProperty("name");
      expect(u).toHaveProperty("email");
      expect(u).not.toHaveProperty("password");
      expect(u).toHaveProperty("_id");
    });
  });

  it("return 403 if user is customer", async () => {
    let token = sign({ id: userCustomer._id }, process.env.PRIVATE_KEY, {
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
  it("return page 1 and 100 element when page=0 and lmit=0", async () => {
    let token = sign({ id: userAgent._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });

    const res = await request(server)
      .get("/api/v1/user/list-all-user?page=0&limit=0")
      .set("Authorization", token);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "List of users");
    expect(res.body.users.length).toBe(100);
  });

  it("return no user found when total element less than equal to limit field", async () => {
    let token = sign({ id: userAgent._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });

    const res = await request(server)
      .get("/api/v1/user/list-all-user?page=2&limit=1000000")
      .set("Authorization", token);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "No User Found !");
  });
});

describe("/api/v1/user/edit-user/:id", () => {
  let userAdmin;
  let customer;
  beforeEach(async () => {
    server = require("../../../server");
    userAdmin = await User.create({
      name: "avi",
      email: "Avi@gmail.com",
      password: "helloworld",
      roles: "admin",
    });

    customer = await User.create({
      name: "cust",
      email: "cust@gmail.com",
      password: "password",
      roles: "customer",
    });
  });
  afterEach(async () => {
    await User.deleteOne({ email: "Avi@gmail.com" });
    await User.deleteOne({ email: "cust@gmail.com" });
    const id = mongoose.Types.ObjectId("603d706ac2d12f3e4988698a");
    await User.findOneAndUpdate({ _id: id }, { roles: "agent" }, { new: true });
    server.close();
  });

  it("check for in valid params id", async () => {
    let tokenAdmin = sign({ id: userAdmin._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });

    const res = await request(server)
      .patch("/api/v1/user/edit-user/1234")
      .set("Authorization", tokenAdmin);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid Id");
  });

  it("return 200 and Already Updated if payload present and past atrributes are same", async () => {
    let tokenAdmin = sign({ id: userAdmin._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });

    const res = await request(server)
      .patch("/api/v1/user/edit-user/" + userAdmin._id)
      .send({
        roles: "admin",
      })
      .set("Authorization", tokenAdmin);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Already Updated !");
  });

  it("return 400 if invalid payload is for update", async () => {
    let tokenAdmin = sign({ id: userAdmin._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });
    const res = await request(server)
      .patch("/api/v1/user/edit-user/" + userAdmin._id)
      .send({
        password: "some password",
        name: "some name",
      })
      .set("Authorization", tokenAdmin);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid payload");
  });

  it("return 200 on sucessfull updattion", async () => {
    let token = sign({ id: userAdmin._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });

    // const id = mongoose.Types.ObjectId("603d706ac2d12f3e4988698a");
    const res = await request(server)
      .patch("/api/v1/user/edit-user/" + customer._id)
      .send({
        roles: "admin",
      })
      .set("Authorization", token);

    const user = await User.findOne({ _id: customer._id });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "Updated sucessfully !");
    expect(user.roles).toBe("admin");
  });

  it("return authorization error if customer try to edit", async () => {
    const token = sign({ id: customer.id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });
    let userId = mongoose.Types.ObjectId("6036ca34b95e5903c5600206");

    const res = await request(server)
      .patch("/api/v1/user/edit-user/" + userId)
      .send({
        roles: "agent",
      })
      .set("Authorization", token);

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({
      message: "You are not authorized for this action !",
    });
  });
});
