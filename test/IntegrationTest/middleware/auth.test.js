let server;
const request = require("supertest");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const { sign } = require("jsonwebtoken");

describe("testing auth middleware", () => {
  beforeEach(() => {
    server = require("../../../server");
  });

  afterEach(() => {
    server.close();
  });

  it("return 401 if token is invalid", async () => {
    let token = "aaa";
    const res = await request(server)
      .get("/api/v1/user/list-all-user")
      .set("Authorization", token);

    expect(res.status).toBe(401);
    expect(res.body).not.toBeNull;
    expect(res.body).toHaveProperty("message", "jwt malformed");
  });
});
