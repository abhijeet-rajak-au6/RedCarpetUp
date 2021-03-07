const mongoose = require("mongoose");
const AppError = require("../util/appErrorHandler");
const Response = require("../util/responseHandler");
const loanModel = require("../models/Loan");
const userModel = require("../models/User");

const APIFeature = require("../util/APIFeature");

const {
  modifyOne,
  getOne,
  modifyById,
  getAll,
} = require("../Controller/handleFactory");
const moment = require("moment");
// const client = require("../redisServer");
const { deleteOne } = require("../models/Loan");

// const { JsonWebTokenError } = require("jsonwebtoken");
// const { updateOne } = require("../models/Loan");
module.exports = {
  async loanRequest(req, res, next) {
    // NOTE: Here I am not updating the loan Start date so when it got approved loan Start date begins and there handling of date is done
    try {
      const {
        principleAmount,
        bankName,
        modeOfInterest,
        bankAccountNo,
        duration,
      } = req.body;

      const { customerId } = req.params;

      // check for valid params Id

      if (!mongoose.Types.ObjectId.isValid(customerId))
        throw new AppError("Invalid customer id", 400);

      //saved the detail to database
      const loanRequest = new loanModel({
        principleAmount,
        bankName,
        modeOfInterest,
        bankAccountNo: String(bankAccountNo),
        duration,
        loanState: "NEW",
        agent: req.user.id,
        customer: customerId,
      });
      // console.log(loanRequest.id);
      // delete loanRequest.id;

      if (!principleAmount)
        throw new AppError("principle Amount not found !", 400);

      if (!duration) throw new AppError("duration not found !", 400);
      if (!loanRequest.validateLoanMode(modeOfInterest))
        throw new AppError("Invalid Loan mode", 400);

      if (!loanRequest.validateBankName(bankName))
        throw new AppError(
          "We have loan facility for HDFC or Axis or SBI bank",
          400
        );

      if (!loanRequest.validateBankAccountNo(String(bankAccountNo)))
        throw new AppError("Bank account can either be 8 or 12 digit", 400);

      const { emi, totalAmount, interestPayable } = calculateEmi(loanRequest);
      // add emi totalAmount and InterestPayable

      loanRequest["emi"] = emi;
      loanRequest["totalAmount"] = totalAmount;
      loanRequest["interestPayable"] = interestPayable;

      const savedLoanRequest = await loanRequest.save();

      // check loan created or not
      if (!savedLoanRequest) {
        throw new AppError("Please try again to create", 500);
      }

      // response
      // console.log("savedLoanrequest", savedLoanRequest);
      req.locals = new Response("Your loan request has been saved !", 201, {
        loanDetails: savedLoanRequest,
      });
      next();
    } catch (err) {
      // console.log(err.message);
      next(new AppError(err.message, err.statusCode));
    }
  },

  async approveLoan(req, res, next) {
    try {
      // getting loanId
      const { loanId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(loanId))
        throw new AppError("Invalid loan id", 400);
      // chacking for existence of loan of that id
      const loan = await getOne(loanModel, { _id: loanId });
      if (loan) {
        // calculateEmi(loan);
        // check for loan State
        if (loan.loanState !== "APPROVED") {
          // const { emi, totalAmount, interestPayable } = calculateEmi(loan);

          const approvedLoan = await modifyOne(
            loanModel,
            {
              loanState: "APPROVED",
              loanStart: Date.now(),
              timeZoneOffset: req.headers.timezoneoffset || -330, // do header check
            },
            { _id: loanId }
          );

          // check whether loan approved or not
          if (approvedLoan.n && approvedLoan.nModified) {
            let getApprovedLoan = await getOne(loanModel, {
              _id: loanId,
            });
            // delete getApprovedLoan.id;

            // handling of dates for various time zone
            let serverOffset = new Date().getTimezoneOffset() * -1;
            let clientOffset = getApprovedLoan.timeZoneOffset * -1;
            let offset;

            serverOffset === clientOffset
              ? (offset = serverOffset)
              : (offset = serverOffset + clientOffset);

            let date = moment(getApprovedLoan.loanStart)
              .utcOffset(offset)
              .format("DD-MM-YYYY, hh:mm:ss");

            // getApprovedLoan = JSON.parse(JSON.stringify(getApprovedLoan));
            getApprovedLoan = getApprovedLoan.toObject();

            delete getApprovedLoan.timeZoneOffset;
            // console.log(getApprovedLoan.loanStart);
            getApprovedLoan.loanStart = date;

            req.locals = new Response(
              "Loan have been sucessfully approved !",
              201,
              {
                LoanDetails: {
                  getApprovedLoan,
                },
              }
            );
            next();
          } else if (approvedLoan.n) {
            throw new AppError("Loan have been already approved", 400);
          } else {
            throw new AppError("Loan not found !", 404);
          }
        } else {
          throw new AppError("loan is already approved !", 400);
        }
      } else {
        throw new AppError("Loan not found !", 404);
      }
    } catch (err) {
      next(new AppError(err.message, err.statusCode));
    }
  },

  async editLoan(req, res, next) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { loanId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(loanId))
        throw new AppError("Invalid loan id", 400);

      const {
        principleAmount,
        duration,
        bankName,
        modeOfInterest,
        bankAccountNo,
      } = req.body;
      let filteredBody = {};

      const body = [
        "principleAmount",
        "duration",
        "bankName",
        "modeOfInterest",
        "bankAccountNo",
      ];

      Object.keys(req.body).map((key) =>
        body.includes(key) ? (filteredBody[key] = req.body[key]) : null
      );

      // check for approved loan

      const loan = await getOne(loanModel, { _id: loanId });
      if (!loan) {
        throw new AppError("Loan not found !", 404);
      }

      if (loan && loan.loanState === "APPROVED") {
        throw new AppError("Cant edit as loan is already approved", 403);
      }

      // below comment line saves the previous loan value but while docerizing
      // redis server is not connecting therefore need to comment out the code

      /* client.set("key", loan, (err) => err);
       client.get("key", (err, value) => console.log("value", value));*/

      /// trasacttion start

      const opts = { session, new: true };
      let modifiedLoan = await modifyById(
        loanModel,
        { ...filteredBody },
        { _id: mongoose.Types.ObjectId(loanId) },
        opts
      );

      // validate bank
      modifiedLoan.validateBankName(modifiedLoan.bankName);

      // calculate emi after validation

      let { emi, totalAmount, interestPayable } = calculateEmi(modifiedLoan);

      let modifyAmount = await modifyOne(
        loanModel,
        {
          ...JSON.parse(JSON.stringify(modifiedLoan)),
          emi: emi,
          totalAmount: totalAmount,
          interestPayable: interestPayable,
        },
        { _id: loanId },
        opts
      );

      if (modifyAmount.n && modifyAmount.nModified) {
        await session.commitTransaction();
        req.locals = new Response("Loan updated sucessfully", 201);
      } else if (modifyAmount.n)
        req.locals = new Response("Already updated", 200);
      else {
        throw new AppError("Loan not found", 404);
      }
      next();
    } catch (err) {
      await session.abortTransaction();
      next(new AppError(err.message, err.statusCode));
    }
  },
  /// @todo

  async getLoans(req, res, next) {
    try {
      // console.log("con", req.connection.remoteAddress);
      let allLoans, loan;
      // check user

      const user = await getOne(userModel, {
        _id: req.user.id,
      });

      const filterAttr = {
        principleAmount: 1,
        bankName: 1,
        modeOfInterest: 1,
        bankAccountNo: 1,
        duration: 1,
        loanState: 1,
        agent: 1,
        customer: 1,
        loanStart: 1,
        interestRate: 1,
        emi: 1,
        interestPayable: 1,
        totalAmount: 1,
        timeZoneOffset: 1,
      };

      if (user.roles === "admin" || user.roles === "agent") {
        allLoans = loanModel
          .find({})
          .populate({
            path: "customer",
            select: {
              name: 1,
              email: 1,
              _id: 0,
            },
          })
          .populate({
            path: "agent",
            select: {
              name: 1,
              email: 1,
              _id: 0,
            },
          })
          .select(filterAttr)
          .lean();

        const features = new APIFeature(allLoans, req.query)
          .filter(req.headers.timezoneoffset * 1)
          .sort()
          .limitFields()
          .paginate();

        allLoans = await features.query;

        if (!allLoans.length) throw new AppError("No Loan Found !", 404);

        allLoans.map((al) => {
          al.loanStart = moment(al.loanStart)
            .utc(al.timeZoneOffset * -1)
            .format("DD-MM-YYYY, hh:mm:ss");
          delete al.id;
          delete al.__v;
        });

        req.locals = new Response("All loans", 200, {
          allLoans,
        });
      } else {
        loan = loanModel
          .find({ customer: req.user.id })
          .populate({
            path: "customer",
            select: { name: 1, email: 1 },
          })
          .select(filterAttr)
          .lean();
        const features = new APIFeature(loan, req.query)
          .filter(req.headers.timezoneoffset * 1)
          .sort()
          .limitFields()
          .paginate();

        allLoans = await features.query;
        // console.log("All loan", allLoans);
        if (!allLoans.length)
          throw new AppError("Loan not found between loan Start date", 404);

        allLoans.map((al) => {
          al.loanStart = moment(al.loanStart)
            .utc(al.timeZoneOffset * -1)
            .format("DD-MM-YYYY, hh:mm:ss");
          delete al.id;
          delete al.__v;
        });

        // delete loan.id;
        if (!allLoans.length)
          throw new AppError("Customer donot have issued any loan !", 404);
        // console.log(loan);

        req.locals = new Response("All loans", 200, { allLoans });
      }

      // get all loans
      next();
    } catch (err) {
      next(new AppError(err.message, err.statusCode));
    }
  },
  async payEmi(req, res, next) {
    try {
      const { loanId } = req.params;

      const loan = await loanModel
        .findOne({ _id: loanId })
        .select({ emi: 1, currentLoanBalance: 1 });

      if (loan.currentLoanBalance <= 0)
        throw new AppError("you have sucessfully have paid your loan !", 403);

      if (!loan) throw new AppError("Loan not found!", 404);

      const match = { _id: loanId, customer: req.user.id };
      const set = {
        dateOfUpdate: new Date(),
        currentLoanBalance: loan.currentLoanBalance - loan.emi,
      };
      const opt = { new: true };

      const loanUpdated = await loanModel.updateOne(match, set, opt);

      if (loanUpdated.n && loanUpdated.nModified) {
        req.locals = new Response("Emi have been paid sucessfully", 201);
      } else if (!loanUpdated.n) {
        throw new AppError("Not authorized to pay anyone loan !", 400);
      }
      next();
    } catch (err) {
      next(new AppError(err.message, err.statusCode));
    }
  },
};

function calculateEmi(loan) {
  let p = loan.principleAmount;
  let r = loan.interestRate;
  let n = loan.duration;
  let emi, totalAmount, interestPayable;
  if (loan.modeOfInterest === "DI") {
    emi =
      (((p * r) / (100 * 12)) * Math.pow(1 + r / (100 * 12), n)) /
      (Math.pow(1 + r / (100 * 12), n) - 1);

    totalAmount = emi * loan.duration;
    interestPayable = totalAmount - p;
  } else {
    interestPayable = (p * n * r) / (100 * 12);
    totalAmount = p + interestPayable;
    emi = (p + interestPayable) / n;
  }

  return {
    emi: emi.toFixed(4),
    totalAmount: totalAmount.toFixed(4),
    interestPayable: interestPayable.toFixed(4),
  };
}
