const userModel = require("../models/User");
const { validationResult } = require("express-validator");
const { getOne } = require("../Controller/handleFactory");
const AppError = require("../util/appErrorHandler");

module.exports = {
  authorized: (...roles) => async (req, res, next) => {
    try {
      console.log("in authorized");
      const condition = { _id: req.user.id, roles: { $in: roles } };
      const getAuthorizedUser = await getOne(userModel, condition);
      if (!getAuthorizedUser)
        throw new AppError("You are not authorized for this action !", 403);
      return next();
    } catch (err) {
      next(new AppError(err.message, err.statusCode));
    }
  },
};
