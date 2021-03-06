const userModel = require("../models/User");
const { Schema } = require("mongoose");
const {
  createOne,
  modifyOne,
  getOne,
  getAll,
} = require("../Controller/handleFactory");
const AppError = require("../util/appErrorHandler");
const Response = require("../util/responseHandler");
const mongoose = require("mongoose");

module.exports = {
  async register(req, res, next) {
    try {
      //payload
      const { password, email, name, roles } = req.body;

      console.log(password.length);
      console.log(email.length);
      // create user
      const newUser = await createOne(userModel, {
        password,
        email,
        name,
        roles,
      });

      // console.log("new user token",newUser.token);
      const user = await newUser.save();

      if (!user) {
        throw new AppError("user not registered please try again !", 400);
      }
      req.locals = new Response("user registered sucessfully", 201);

      // generate response
      next();
    } catch (err) {
      next(new AppError(err.message, err.statusCode || 500));
    }
  },
  async login(req, res, next) {
    try {
      //payload
      const { password, email } = req.body;

      // find email and password
      const user = await userModel.findByEmailAndPassword(email, password);
      // generate token
      user.generateToken();

      // save the token
      await user.save({ validateBeforeSave: false });

      // response
      req.locals = new Response(`Welcome ${user.name}`, 200, {
        token: user.token,
      });
      next();
    } catch (err) {
      next(new AppError(err.message, err.statusCode));
    }
  },

  async logout(req, res, next) {
    try {
      const currentUser = req.user.id;
      condition = { _id: currentUser };
      const user = await getOne(userModel, condition);
      if (user) {
        user.token = null;

        await user.save({ validateBeforeSave: false });
        req.locals = new Response("Thank you visit again", 200);
        next();
      }
      throw new AppError("Session expired", 400);
    } catch (err) {
      next(new AppError(err.message, err.statusCode));
    }
  },
  async listAllUsers(req, res, next) {
    try {
      const { pageNo, limit } = req.query;
      const attributes = ["name", "email", "roles"];
      const allUsers = await getAll(userModel, req.query);
      if (!allUsers.length > 0) {
        throw new AppError("No User Found !", 404);
      }
      req.locals = new Response("List of users", 200, { users: allUsers });
      next();
    } catch (err) {
      console.log(err);
      next(new AppError(err.message, err.statusCode));
    }
  },

  async editUser(req, res, next) {
    try {
      const parameter = Object.keys(req.body);
      console.log(req.body[parameter[0]]);
      const { id } = req.params;

      // check for valid params id

      if (!mongoose.Types.ObjectId.isValid(id))
        throw new AppError("Invalid Id", 400);

      // console.log(Mongoose.Types.ObjectId(id));
      let set = {};
      let condition = { _id: mongoose.Types.ObjectId(id) };

      parameter.map((p) => {
        if (p === "roles") set[p] = req.body[p].toLowerCase();
      });

      if (!Object.keys(set).length) throw new AppError("Invalid payload", 400);

      const updatedUser = await modifyOne(userModel, set, condition);

      console.log("updatedUser", updatedUser);
      if (!updatedUser.n) throw new AppError("User not found !", 404);

      if (!updatedUser.nModified) {
        req.locals = new Response("Already Updated !", 200);
        next();
      }

      req.locals = new Response("Updated sucessfully !", 201);

      next();
    } catch (err) {
      console.log(err.name, err.code);
      next(new AppError(err.message, err.statusCode));
    }
  },
};
