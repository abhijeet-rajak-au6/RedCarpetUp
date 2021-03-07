const request = require("supertest");
const { sign, verify } = require("jsonwebtoken");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const loanModel = require("../../../models/Loan");
const userModel = require("../../../models/User");
dotenv.config();
let server;

describe("/api/v1/loan/loan-request/:customerId", () => {
  let token;
  let customer;
  let admin;
  let agent;
  beforeEach(async () => {
    server = require("../../../server");
    token = sign(
      { id: new mongoose.Types.ObjectId() },
      process.env.PRIVATE_KEY,
      { expiresIn: 60 * 10 }
    );

    customer = await userModel.create({
      name: "Abhi",
      email: "abhijeetrajak10@gmail.com",
      password: "hellowrld",
      roles: "customer",
    });

    admin = await userModel.create({
      name: "Hello",
      email: "avi10@gmail.com",
      password: "hellowrld",
      roles: "admin",
    });

    agent = await userModel.create({
      name: "World",
      email: "world@gmail.com",
      password: "world hello",
      roles: "agent",
    });
  });

  afterEach(async () => {
    server.close();
    await userModel.remove({
      email: {
        $in: [
          "abhijeetrajak10@gmail.com",
          "avi10@gmail.com",
          "world@gmail.com",
        ],
      },
    });

    await loanModel.remove({
      customer: customer._id,
    });
  });

  it("return 401 if not authenticated", async () => {
    const res = await request(server)
      .post("/api/v1/loan/loan-request/" + new mongoose.Types.ObjectId())
      .send({});

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "token not found");
  });

  it("return 403 if request loan is done by customer or admin", async () => {
    let tokenCustomer = sign({ id: customer._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });

    let tokenAdmin = sign({ id: admin._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });

    const resCustomer = await request(server)
      .post("/api/v1/loan/loan-request/" + customer._id)
      .set("Authorization", tokenCustomer)
      .send({});

    const resAdmin = await request(server)
      .post("/api/v1/loan/loan-request/" + customer._id)
      .set("Authorization", tokenAdmin)
      .send({});

    const loan = await loanModel.findOne({
      customer: customer._id,
    });

    expect(resCustomer.status).toBe(403);
    expect(resAdmin.status).toBe(403);
    expect(resCustomer.body).toHaveProperty(
      "message",
      "You are not authorized for this action !"
    );
    expect(resAdmin.body).toHaveProperty(
      "message",
      "You are not authorized for this action !"
    );
    expect(loan).toBeNull();
  });

  it("return 400 if customerId is not valid", async () => {
    let tokenAgent = sign({ id: agent._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });
    const res = await request(server)
      .post("/api/v1/loan/loan-request/" + 1234)
      .send({})
      .set("Authorization", tokenAgent);

    const loan = await loanModel.findOne({
      customer: mongoose.Types.ObjectId(1234),
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid customer id");
    expect(loan).toBeNull();
  });

  it("return 400 if loan mode is invalid", async () => {
    let tokenAgent = sign({ id: agent._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });
    const res = await request(server)
      .post("/api/v1/loan/loan-request/" + customer._id)
      .send({
        principleAmount: 50000,
        bankName: "HDFC",
        bankAccountNo: "Axis12345678",
        duration: 12,
        modeOfInterest: "CI",
      })
      .set("Authorization", tokenAgent);

    const loan = await loanModel.findOne({
      customer: customer._id,
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid Loan mode");
    expect(loan).toBeNull();
  });

  it("return 400 if empty bank is", async () => {
    let tokenAgent = sign({ id: agent._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });
    const res = await request(server)
      .post("/api/v1/loan/loan-request/" + customer._id)
      .send({
        principleAmount: 50000,
        bankAccountNo: "Axis12345678",
        duration: 12,
        modeOfInterest: "RI",
        bankName: "",
      })
      .set("Authorization", tokenAgent);

    const loan = await loanModel.findOne({
      customer: customer._id,
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "message",
      "We have loan facility for HDFC or Axis or SBI bank"
    );
    expect(loan).toBeNull();
  });

  it("return 400 if invalid bank account", async () => {
    let tokenAgent = sign({ id: agent._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });
    const res = await request(server)
      .post("/api/v1/loan/loan-request/" + customer._id)
      .send({
        modeOfInterest: "RI",
        bankName: "HDFC",
        principleAmount: 50000,
        duration: 12,
        bankAccountNo: 1233456,
      })
      .set("Authorization", tokenAgent);

    const loan = await loanModel.findOne({
      customer: customer._id,
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "message",
      "Bank account can either be 8 or 12 digit"
    );
    expect(loan).toBeNull();
  });

  it("return 200 if loan request have been saved", async () => {
    let tokenAgent = sign({ id: agent._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });
    const res = await request(server)
      .post("/api/v1/loan/loan-request/" + customer._id)
      .send({
        modeOfInterest: "RI",
        bankName: "HDFC",
        bankAccountNo: 12334567,
        principleAmount: 100000,
        duration: 12,
      })
      .set("Authorization", tokenAgent);

    const loan = await loanModel.findOne({
      customer: customer._id,
    });

    // expect(res.status).toBe(201);
    expect(res.body).toHaveProperty(
      "message",
      "Your loan request has been saved !"
    );
    expect(loan).not.toBeNull();
  });
});

// @todo
describe("/api/v1/loan/approve-loan/:loanId", () => {
  let customer;
  let agent;
  let token;
  let admin;
  let loanRequest;
  let approvedLoan;
  beforeEach(async () => {
    server = require("../../../server");
    customer = await userModel.create({
      name: "avi",
      email: "avi@gmail.com",
      password: "helloworld",
      roles: "customer",
    });

    agent = await userModel.create({
      name: "agent",
      email: "agent@gmail.com",
      password: "agent1234567",
      roles: "agent",
    });

    admin = await userModel.create({
      name: "admin",
      email: "admin@gmail.com",
      password: "admin1234567",
      roles: "admin",
    });
    loanRequest = await new loanModel({
      principleAmount: 400000,
      bankName: "HDFC",
      modeOfInterest: "FI",
      duration: 12,
      bankAccountNo: "HDFC58734679",
    }).save({ validateBeforeSave: false });

    approvedLoan = await new loanModel({
      principleAmount: 400000,
      bankName: "HDFC",
      modeOfInterest: "FI",
      duration: 12,
      bankAccountNo: "HDFC58734679",
      loanState: "APPROVED",
      loanStart: Date.now(),
      timeZoneOffset: 330,
    }).save({ validateBeforeSave: false });

    token = sign({ id: admin._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });
  });

  afterEach(async () => {
    server.close();
    await userModel.remove({
      email: { $in: ["avi@gmail.com", "agent@gmail.com", "admin@gmail.com"] },
    });
    await loanModel.remove({
      _id: loanRequest._id,
    });
    await loanModel.remove({
      _id: approvedLoan._id,
    });
  });

  it("return 403 if customer or agent tries to approve loan", async () => {
    token = sign({ id: customer._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });
    const res = await request(server)
      .post("/api/vi/loan/approve-loan/" + loanRequest._id)
      .set("Authorization", token)
      .send({});

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty(
      "message",
      "You are not authorized for this action !"
    );
  });

  it("return 400 if loan id is invalid", async () => {
    const res = await request(server)
      .post("/api/vi/loan/approve-loan/" + 1234)
      .set("Authorization", token)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid loan id");
  });
  it("return 404 if loan is not found", async () => {
    const loanId = new mongoose.Types.ObjectId();
    const res = await request(server)
      .post("/api/vi/loan/approve-loan/" + loanId)
      .set("Authorization", token);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "Loan not found !");
  });
  it("return 400 if loan is already approved", async () => {
    const res = await request(server)
      .post("/api/vi/loan/approve-loan/" + approvedLoan._id)
      .set("Authorization", token)
      .send({});

    // console.log(res.body);

    const loan = await loanModel.findOne({
      _id: approvedLoan._id,
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "loan is already approved !");
    expect(loan.loanState).toBe("APPROVED");
  });
  it("return 201 if loan is approved sucessfully", async () => {
    const res = await request(server)
      .post("/api/vi/loan/approve-loan/" + loanRequest._id)
      .set("Authorization", token);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty(
      "message",
      "Loan have been sucessfully approved !"
    );
    expect(res.body.LoanDetails.getApprovedLoan.loanState).toBe("APPROVED");
  });
});

describe("/api/v1/loan/edit-loan/:loanId", () => {
  let agent, admin, customer;
  let token;
  let approvedLoan, loanRequest;
  beforeEach(async () => {
    server = require("../../../server");
    agent = await userModel.create({
      name: "agent",
      email: "agent@gmail.com",
      password: "agent1234567",
      roles: "agent",
    });

    admin = await userModel.create({
      name: "admin",
      email: "admin@gmail.com",
      password: "admin1234567",
      roles: "admin",
    });

    customer = await userModel.create({
      name: "customer",
      email: "customer@gmail.com",
      password: "customer1234567",
      roles: "customer",
    });
    //
    approvedLoan = await new loanModel({
      principleAmount: 400000,
      bankName: "HDFC",
      modeOfInterest: "FI",
      duration: 12,
      bankAccountNo: "HDFC58734679",
      loanState: "APPROVED",
      loanStart: Date.now(),
      timeZoneOffset: 330,
    }).save({ validateBeforeSave: false });

    loanRequest = await new loanModel({
      principleAmount: 400000,
      bankName: "HDFC",
      modeOfInterest: "FI",
      duration: 12,
      bankAccountNo: "HDFC58734679",
      loanState: "NEW",
    }).save({ validateBeforeSave: false });

    token = sign({ id: agent._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });
  });

  afterEach(async () => {
    server.close();
    await userModel.remove({
      email: {
        $in: ["agent@gmail.com", "admin@gmail.com", "customer@gmail.com"],
      },
    });
    await loanModel.remove({
      id: loanRequest._id,
    });
  });

  it("return 400 if invalid loan Id", async () => {
    const res = await request(server)
      .patch("/api/v1/loan/edit-loan/" + 1234)
      .set("Authorization", token)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Invalid loan id");
  });
  it("return 404 if loan is not found", async () => {
    const loanId = new mongoose.Types.ObjectId();

    const res = await request(server)
      .patch("/api/v1/loan/edit-loan/" + loanId)
      .set("Authorization", token)
      .send();

    const loan = await loanModel.findOne({
      _id: loanId,
    });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message", "Loan not found !");
    expect(loan).toBeNull();
  });
  it("return 403 if loan is already get approved", async () => {
    const res = await request(server)
      .patch("/api/v1/loan/edit-loan/" + approvedLoan._id)
      .set("Authorization", token)
      .send({});

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty(
      "message",
      "Cant edit as loan is already approved"
    );
  });
  it("return 403 if customer or admin try to edit loan", async () => {
    token = sign({ id: admin._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });
    let res = await request(server)
      .patch("/api/v1/loan/edit-loan/" + loanRequest._id)
      .set("Authorization", token)
      .send({});

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty(
      "message",
      "You are not authorized for this action !"
    );

    token = sign({ id: customer._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });

    res = await request(server)
      .patch("/api/v1/loan/edit-loan/" + customer._id)
      .set("Authorization", token)
      .send({});

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty(
      "message",
      "You are not authorized for this action !"
    );
  });
  it("return 201 if loan is edited sucessfully", async () => {
    token = sign({ id: agent._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });

    const res = await request(server)
      .patch("/api/v1/loan/edit-loan/" + loanRequest._id)
      .set("Authorization", token)
      .send({
        principleAmount: 700000,
        duration: 36,
        bankName: "SBI",
        modeOfInterest: "FI",
      });

    const loan = await loanModel.findOne({
      _id: loanRequest._id,
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message", "Loan updated sucessfully");
    expect(loan.principleAmount).toBe(700000);
    expect(loan.duration).toBe(36);
    expect(loan.bankName).toBe("SBI");
    expect(loan.modeOfInterest).toBe("FI");
  });
});

describe("/api/v1/loan/get-all-loans", () => {
  let agent, admin, customer1, token, customer2;
  beforeEach(async () => {
    server = require("../../../server");
    agent = await userModel.create({
      name: "agent",
      email: "agent@gmail.com",
      password: "agent1234567",
      roles: "agent",
    });

    admin = await userModel.create({
      name: "admin",
      email: "admin@gmail.com",
      password: "admin1234567",
      roles: "admin",
    });

    customer1 = await userModel.create({
      name: "customer",
      email: "customer@gmail.com",
      password: "customer1234567",
      roles: "customer",
    });
    customer2 = await userModel.create({
      name: "AnotherCustomer",
      email: "another_customer@gmail.com",
      password: "another_customer1234567",
      roles: "customer",
    });

    loan = loanModel.insertMany([
      {
        agent: "60429b7dfc13ae1ee7000000",
        customer: customer1._id,
        loanStart: new Date("6/21/2020"),
        duration: 51,
        emi: 86,
        interestRate: 10,
        bankAccountNo: "HDFC58734679",
        principleAmount: 66,
        bankName: "SBI",
        loanState: "NEW",
        dateOfUpdate: new Date("7/2/2020"),
        modeOfInterest: "FI",
        totalAmount: 68,
        currentBalance: 14,
        timeZoneOffset: -330,
      },
      {
        agent: "60429b7dfc13ae1ee7000000",
        customer: customer1._id,
        loanStart: new Date("6/22/2020"),
        duration: 51,
        emi: 86,
        interestRate: 10,
        bankAccountNo: "HDFC58734679",
        principleAmount: 66,
        bankName: "Axis",
        loanState: "APPROVED",
        dateOfUpdate: new Date("7/3/2020"),
        modeOfInterest: "FI",
        totalAmount: 68,
        currentBalance: 14,
        timeZoneOffset: -330,
      },
      {
        agent: "60429b7dfc13ae1ee7000000",
        customer: customer1._id,
        loanStart: new Date("6/23/2020"),
        duration: 51,
        emi: 86,
        interestRate: 10,
        bankAccountNo: "HDFC58734679",
        principleAmount: 66,
        bankName: "HDFC",
        loanState: "REJECTED",
        dateOfUpdate: new Date("7/4/2020"),
        modeOfInterest: "FI",
        totalAmount: 68,
        currentBalance: 14,
        timeZoneOffset: -330,
      },
      {
        agent: "60429b7dfc13ae1ee7000000",
        customer: customer2._id,
        loanStart: new Date("6/24/2020"),
        duration: 51,
        emi: 86,
        interestRate: 10,
        bankAccountNo: "HDFC58734679",
        principleAmount: 66,
        bankName: "SBI",
        loanState: "NEW",
        dateOfUpdate: new Date("7/5/2020"),
        modeOfInterest: "RI",
        totalAmount: 68,
        currentBalance: 14,
        timeZoneOffset: -330,
      },
    ]);
  });

  afterEach(async () => {
    server.close();
    await userModel.remove({
      email: {
        $in: [
          "customer@gmail.com",
          "admin@gmail.com",
          "agent@gmail.com",
          "another_customer@gmail.com",
        ],
      },
    });
    // await loanModel.remove({});
    await loanModel.remove({
      customer: customer1._id,
    });

    await loanModel.remove({
      customer: customer2._id,
    });
  });

  it("return all NEW loans", async () => {
    // for agent
    token = sign({ id: agent._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });

    let res = await request(server)
      .get("/api/v1/loan/get-all-loans?loanState=NEW")
      .set("Authorization", token);

    expect(res.status).toBe(200);
    res.body.allLoans.map((loan) => expect(loan.loanState).toBe("NEW"));

    // for admin
    token = sign({ id: admin._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });

    res = await request(server)
      .get("/api/v1/loan/get-all-loans?loanState=NEW")
      .set("Authorization", token);

    expect(res.status).toBe(200);
    res.body.allLoans.map((loan) => expect(loan.loanState).toBe("NEW"));

    // for customer

    token = sign({ id: customer1._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });

    res = await request(server)
      .get("/api/v1/loan/get-all-loans?loanState=NEW")
      .set("Authorization", token);

    expect(res.status).toBe(200);
    res.body.allLoans.map((loan) => expect(loan.loanState).toBe("NEW"));
  });
  it("return all APPROVED loans", async () => {
    token = sign({ id: agent._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });

    let res = await request(server)
      .get("/api/v1/loan/get-all-loans?loanState=APPROVED")
      .set("Authorization", token);

    expect(res.status).toBe(200);
    res.body.allLoans.map((loan) => expect(loan.loanState).toBe("APPROVED"));

    // for admin
    token = sign({ id: admin._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });

    res = await request(server)
      .get("/api/v1/loan/get-all-loans?loanState=APPROVED")
      .set("Authorization", token);

    expect(res.status).toBe(200);
    res.body.allLoans.map((loan) => expect(loan.loanState).toBe("APPROVED"));

    token = sign({ id: customer1._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });

    res = await request(server)
      .get("/api/v1/loan/get-all-loans?loanState=APPROVED")
      .set("Authorization", token);

    expect(res.status).toBe(200);
    res.body.allLoans.map((loan) => expect(loan.loanState).toBe("APPROVED"));
  });
  it("return all REJECTED loans", async () => {
    token = sign({ id: agent._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });

    let res = await request(server)
      .get("/api/v1/loan/get-all-loans?loanState=REJECTED")
      .set("Authorization", token);

    // console.log(res.body);
    expect(res.status).toBe(200);
    res.body.allLoans.map((loan) => expect(loan.loanState).toBe("REJECTED"));

    // for admin
    token = sign({ id: admin._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });

    res = await request(server)
      .get("/api/v1/loan/get-all-loans?loanState=REJECTED")
      .set("Authorization", token);

    expect(res.status).toBe(200);
    res.body.allLoans.map((loan) => expect(loan.loanState).toBe("REJECTED"));

    token = sign({ id: customer1._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });

    res = await request(server)
      .get("/api/v1/loan/get-all-loans?loanState=REJECTED")
      .set("Authorization", token);

    expect(res.status).toBe(200);

    res.body.allLoans.map((loan) => expect(loan.loanState).toBe("REJECTED"));
  });
  it("return all customer loans", async () => {
    token = sign({ id: customer1._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });

    let res = await request(server)
      .get("/api/v1/loan/get-all-loans")
      .set("Authorization", token);

    expect(res.body.allLoans.length).toBe(3);
    expect(res.status).toBe(200);

    token = sign({ id: customer2._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });

    res = await request(server)
      .get("/api/v1/loan/get-all-loans")
      .set("Authorization", token);

    expect(res.body.allLoans.length).toBe(1);
    expect(res.status).toBe(200);
  });
  it("return all loans if user is admin or agent", async () => {
    token = sign({ id: admin._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });

    let res = await request(server)
      .get("/api/v1/loan/get-all-loans")
      .set("Authorization", token);

    // console.log(res.body.allLoans.);
    expect(res.status).toBe(200);
    expect(res.body.allLoans.length).toBe(100);

    token = sign({ id: agent._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });
    res = await request(server)
      .get("/api/v1/loan/get-all-loans")
      .set("Authorization", token);
    expect(res.status).toBe(200);
    expect(res.body.allLoans.length).toBe(100);
  });

  it("return only customer own loan", async () => {
    token = sign({ id: customer1._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });

    let res = await request(server)
      .get("/api/v1/loan/get-all-loans")
      .set("Authorization", token);

    expect(res.status).toBe(200);
    expect(res.body.allLoans.length).toBe(3);

    res.body.allLoans.map((loan) =>
      expect(loan.customer._id).toBe(customer1._id.toString())
    );

    // customer2

    token = sign({ id: customer2._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });

    res = await request(server)
      .get("/api/v1/loan/get-all-loans")
      .set("Authorization", token);

    expect(res.status).toBe(200);
    expect(res.body.allLoans.length).toBe(1);

    res.body.allLoans.map((loan) =>
      expect(loan.customer._id).toBe(customer2._id.toString())
    );
  });
  it("return all loans between date range based on loanStart", async () => {
    token = sign({ id: customer1._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });

    let res = await request(server)
      .get(
        "/api/v1/loan/get-all-loans?loanStart[gte]=21/6/2020&loanStart[lte]=22/09/2021"
      )
      .set("Authorization", token);

    expect(res.status).toBe(200);
    expect(res.body.allLoans.length).toBe(3);

    res = await request(server)
      .get(
        "/api/v1/loan/get-all-loans?loanStart[gte]=21/6/2020&loanStart[lte]=22/06/2020"
      )
      .set("Authorization", token);

    expect(res.status).toBe(200);
    expect(res.body.allLoans.length).toBe(2);
  });

  it("return all loans between date of update", async () => {
    token = sign({ id: admin._id }, process.env.PRIVATE_KEY, {
      expiresIn: 60 * 10,
    });

    let res = await request(server)
      .get(
        "/api/v1/loan/get-all-loans?dateOfUpdate[gte]=2/7/2020&dateOfUpdate[lte]=3/7/2020"
      )
      .set("Authorization", token);

    expect(res.status).toBe(200);
    expect(res.body.allLoans.length).toBe(2);
  });
});
