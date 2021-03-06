const { validationResult } = require("express-validator");
const AppError = require("../util/appErrorHandler");

module.exports = {
  async executeValidation(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new AppError(errors.array()[0].msg, 400));
        // return res.status(403).send({
        //   errors: errors.array(),
        // });
      }
      next();
    } catch (err) {
      // console.log(err);
    }
  },
};
