const { Schema, model } = require("mongoose");
const AppError = require("../util/appErrorHandler");
const loanSchema = Schema({
  agent: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  interestRate: {
    type: Number,
    required: [true, "Please provide interest rate"],
  },
  loanStart: {
    type: Date,
  },
  duration: {
    type: Number,
    required: [true, "Please provide duration rate"],
  },
  emi: {
    type: Number,
  },
  principleAmount: {
    type: Number,
    required: [true, "Please enter the loan amount"],
  },
  bankName: {
    type: String,
    required: [true, "Please Select the bank"],
    validate: {
      validator: function (value) {
        console.log(value);
        const bankData = [
          { name: "HDFC", FI: 8, RI: 10 },
          { name: "Axis", FI: 7, RI: 8 },
          { name: "SBI", FI: 7.5, RI: 8 },
          { name: "ICICI", FI: 8, RI: 10 },
        ];
        let getBank = bankData.find((f) => value === f.name);
        if (!getBank) {
          return false;
        }

        return true;
      },
      message: "Invalid bank",
    },
  },
  loanState: {
    type: String,
    validate: {
      validator: function (value) {
        const loanState = ["NEW", "APPROVED", "REJECTED"];

        if (loanState.includes(value)) {
          return true;
        }
        return false;
      },
      message: "Invalid loan status",
    },
  },
  bankAccountNo: {
    type: String,
    required: [true, "Please provide bank account no"],
    validate: {
      validator: function (value) {
        if (value.length == 8 || value.length == 12) {
          return true;
        }
        return false;
      },
      message: "Invalid account no",
    },
  },

  dateOfUpdate: {
    type: Date,
  },
  modeOfInterest: {
    type: String,
    validate: {
      validator: function (value) {
        const mode = ["FI", "RI"];

        if (mode.includes(value)) {
          return true;
        }
        return false;
      },
      message: "Invalid mode of interest",
    },
  },
  totalAmount: {
    type: Number,
  },
  interestPayable: {
    type: Number,
  },
  timeZoneOffset: {
    type: Number,
  },
  currentLoanBalance: {
    type: Number,
  },
});
loanSchema.methods.validateBankName = function (bankName) {
  console.log("validate");
  const bankData = [
    { name: "HDFC", FI: 8, RI: 10 },
    { name: "Axis", FI: 7, RI: 8 },
    { name: "SBI", FI: 7.5, RI: 8 },
    { name: "ICICI", FI: 8, RI: 10 },
  ];
  let getBank = bankData.find((f) => bankName === f.name);
  if (!getBank) {
    return false;
  }

  console.log("getBank", getBank);
  console.log("modeOfInterest", this.modeOfInterest);
  console.log(this.modeOfInterest === getBank.FI);
  if (this.modeOfInterest === "FI") {
    console.log("hello");
    this.interestRate = getBank.FI;
  } else {
    console.log("world");
    this.interestRate = getBank.RI;
  }
  return true;
};
loanSchema.methods.validateLoanMode = function (loanMode) {
  const loanModes = ["FI", "RI"];

  if (!loanModes.includes(loanMode)) return false;
  return true;
};
loanSchema.methods.validateBankAccountNo = function (bankNo) {
  if (bankNo.length === 8 || bankNo.length === 12) return true;
  return false;
};

loanSchema.post("save", function (error, _, next) {
  console.log(error);
  next(
    error.code === 11000
      ? new AppError(
          "loan have been already  requested with this bank account ! "
        )
      : error
  );
});

loanSchema.pre("updateOne", function (next) {
  this.options.runValidators = true;
  next();
});

const loanModel = model("loan", loanSchema);

module.exports = loanModel;

// validate: {
//     validator: function (value) {
//       const bankData = [
//         { name: "HDFC", FI: 8, RI: 10 },
//         { name: "Axis", FI: 7, RI: 8 },
//         { name: "SBI", FI: 7.5, RI: 8 },
//         { name: "ICICI", FI: 8, RI: 10 },
//       ];
//       let getBank = bankData.find((f) => value === f.name);
//       if (!getBank) {
//         if (this.modeOfInterest === "FI") {
//           this.interestRate = getBank.FI;
//         } else {
//           this.interestRate = getBank.DI;
//         }
//         return true;
//       }
//       return false;
//     },
//     message: "roles can be either admin || agent || customer",
//   },
