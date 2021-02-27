const { Router } = require("express");
const { authenticate } = require("../middleware/authentication");
const { authorized } = require("../middleware/authorization");
const {
  loanRequest,
  approveLoan,
  editLoan,
  getLoans,
  payEmi,
} = require("../Controller/loanController");
const { Send } = require("../middleware/Send");
const loanModel = require("../models/Loan");

const router = Router();

router.post("/api/v1/loan/loan-request/:customerId", [
  authenticate,
  authorized("agent"),
  loanRequest,
  Send,
]);

router.post("/api/vi/loan/approve-loan/:loanId", [
  authenticate,
  authorized("admin"),
  approveLoan,
  Send,
]);

router.patch("/api/v1/loan/edit-loan/:loanId", [
  authenticate,
  authorized("agent"),
  editLoan,
  Send,
]);

router.get("/api/v1/loan/get-all-loans", [authenticate, getLoans, Send]);

router.get("/api/v1/loan/pay-emi/:loanId", [
  authenticate,
  authorized("customer"),
  payEmi,
  Send,
]);

module.exports = router;
