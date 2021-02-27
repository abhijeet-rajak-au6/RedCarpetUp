const AppError = require("../util/appErrorHandler");
let mongoose = require("mongoose");
const APIFeature = require("../util/APIFeature");

module.exports = {
  async createOne(Model, payload) {
    try {
      return Model.create({ ...payload });
    } catch (err) {
      new AppError(err.message, 500);
    }
  },
  async modifyOne(Model, set, condition, opt) {
    console.log("set", set);
    console.log("condition", condition);
    try {
      return Model.updateOne({ ...condition }, { ...set }, { ...opt });
    } catch (err) {
      console.log(err);
      new AppError(err.message, 500);
    }
  },
  async modifyById(Model, set, cond, opt) {
    try {
      return Model.findByIdAndUpdate(cond, { ...set }, { ...opt });
    } catch (err) {
      new AppError(err.message, 500);
    }
  },
  async getOne(Model, query, attributes) {
    console.log(attributes);
    try {
      return Model.findOne(query).select(attributes);
    } catch (err) {
      new AppError(err.message, 500);
    }
  },
  async getAll(Model, searchQuery) {
    try {
      // const pageNo = page * 1 || 0;
      // limit = limit * 1 || 0;
      // const skip = (pageNo - 1) * limit;
      const features = new APIFeature(Model.find(), searchQuery)
        .filter()
        .sort()
        .paginate()
        .limitFields();
      return features.query;
      // return Model.find({}).skip(skip).limit(limit).select(attributes);
    } catch (err) {
      new AppError(err.message, 500);
    }
  },
};
