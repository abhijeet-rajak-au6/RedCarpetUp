const { check, validationResult, query } = require("express-validator");

module.exports = {
  checkValidation(method) {
    console.log(method);
    switch (method) {
      case "USER_REGISTRATION":
        return [
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
          check("password")
            .not()
            .isEmpty()
            .withMessage("please provide password")
            .isLength({ min: 8, max: 20 })
            .withMessage("Length of password should be between 8 to 20"),

          check("roles")
            .toLowerCase()
            .isIn(["admin", "agent", "customer"])
            .withMessage("role should be either : agent || customer || admin"),
        ];
      case "USER_LOGIN":
        console.log(method);
        return [
          check("email")
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
        console.log("update user validation");
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
