const { sign, verify } = require("jsonwebtoken");
const userModel = require("../models/User");
const AppError = require("../util/appErrorHandler");

module.exports = {
  async authenticate(req, res, next) {
    try {
      if (req.headers.authorization || req.query.token) {
        let token = verify(req.headers.authorization, process.env.PRIVATE_KEY);

        req.user = token;
        return next();
      }
      throw new AppError("token not found", 404);
    } catch (err) {
      next(new AppError(err.message, 401));
      // res.status(401).send({ status: "fail", msg: "Authentication failed" });
    }
  },
};
