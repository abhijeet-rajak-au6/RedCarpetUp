const { validationResult } = require("express-validator");
const AppError = require("../util/appErrorHandler");

module.exports = {
  async executeValidation(req, res, next) {
    try {
      console.log("validation executed");
      const errors = validationResult(req);
      console.log(errors);
      if (!errors.isEmpty()) {
        return next(new AppError(errors.array()[0].msg, 400));
        // return res.status(403).send({
        //   errors: errors.array(),
        // });
      }
      console.log("next");
      next();
    } catch (err) {
      console.log(err);
    }
  },
};
