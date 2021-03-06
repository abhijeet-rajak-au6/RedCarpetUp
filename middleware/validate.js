const { check, validationResult, query } = require("express-validator");
const { stackTraceLimit } = require("../util/appErrorHandler");

module.exports = {
  checkValidation(method) {
    switch (method) {
      case "USER_REGISTRATION":
        return [
          check("name")
            .trim()
            .not()
            .isEmpty()
            .withMessage("please provide name")
            .isLength({ min: 3, max: 20 })
            .withMessage("Length of name should be between 3 to 20"),
          check("email")
            .trim()
            .not()
            .isEmpty()
            .withMessage("please provide email")
            .isEmail()
            .withMessage("please provide correct email"),
          check("password")
            .not()
            .isEmpty()
            .withMessage("please provide password")
            .isLength({ min: 8, max: 20 })
            .withMessage("Length of password should be between 8 to 20"),

          check("roles")
            .trim()
            .toLowerCase()
            .isIn(["admin", "agent", "customer"])
            .withMessage("role should be either : agent || customer || admin"),
        ];
      case "USER_LOGIN":
        return [
          check("email")
            .trim()
            .not()
            .isEmpty()
            .withMessage("please provide email")
            .isEmail()
            .withMessage("please provide correct email"),
          check("password")
            .not()
            .isEmpty()
            .withMessage("please provide password")
            .isLength({ min: 8, max: 20 })
            .withMessage("Length of password should be between 8 to 20"),
        ];
      case "UPDATE_USER":
        return [
          check("phone")
            .not()
            .isEmpty()
            .withMessage("please provide your phone")
            .isMobilePhone()
            .withMessage("please enter a valid phone")
            .matches(/^[0-9]{10}$/, "i")
            .withMessage("phone length is invalid"),
          check("name")
            .not()
            .isEmpty()
            .withMessage("please provide name")
            .isLength({ min: 3, max: 20 })
            .withMessage("Length of name should be between 3 to 20"),
          check("email")
            .not()
            .isEmpty()
            .withMessage("please provide first name")
            .isEmail()
            .withMessage("please provide correct email"),
        ];

      default:
        return "Invalid Method";
    }
  },
};
