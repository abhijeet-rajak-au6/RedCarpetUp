const Loan = require("../../../models/Loan");

describe("validate bank details", () => {
  it("positve check for valid bank details", () => {
    const bankName = "HDFC";
    const loan = new Loan({
      modeOfInterest: "RI",
    });
    const value = loan.validateBankName(bankName);
    expect(value).toBeTruthy();
    expect(loan).toHaveProperty("interestRate", 10);
  });
  it("negative check for bank details", () => {
    const bankName = "a";
    const loan = new Loan({
      modeOfInterest: "RI",
    });

    const isValidBank = loan.validateBankName(bankName);

    expect(isValidBank).not.toBeTruthy();

    expect(loan).toHaveProperty("interestRate", undefined);
  });
  it("positive validation of mode of interest", () => {
    const modeOfInterest = "FI";
    const loan = new Loan({
      modeOfInterest,
    });
    const isLoanMode = loan.validateLoanMode(modeOfInterest);
    expect(isLoanMode).toBeTruthy();
  });

  it("negative validation of mode of interest", () => {
    const modeOfInterest = "DI";
    const loan = new Loan({
      modeOfInterest,
    });
    const isLoanMode = loan.validateLoanMode(modeOfInterest);
    expect(isLoanMode).not.toBeTruthy();
  });
  it("positive validate bank Account", () => {
    const loan = new Loan({});
    const bankAccountNo = "Axis12345678";

    const isValidBankAccountNo = loan.validateBankAccountNo(bankAccountNo);

    expect(isValidBankAccountNo).toBeTruthy();
  });
  it("negative validate bank Account", () => {
    const loan = new Loan({});
    const bankAccountNo = "Axis123456 ";

    const isValidBankAccountNo = loan.validateBankAccountNo(bankAccountNo);

    expect(isValidBankAccountNo).not.toBeTruthy();
  });
});
