const { Schema, model } = require("mongoose");
const { sign, verify } = require("jsonwebtoken");
const { compare, hash } = require("bcryptjs");
const AppError = require("../util/appErrorHandler");
const { getOne } = require("../Controller/handleFactory");

const userSchema = Schema({
  name: {
    type: String,
    required: [true, "Please provide your name"],
  },
  email: {
    type: String,
    unique: [true, "email must be unique"],
    required: [true, "Please enter your email"],
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
  },
  token: {
    type: String,
    default: null,
  },
  roles: {
    type: String,
    required: [true, "please select the role"],
    validate: {
      validator: function (value) {
        const roles = ["customer", "admin", "agent"];
        if (roles.includes(value.toLowerCase())) return true;
        return false;
      },
      message: "roles can be either admin || agent || customer",
    },
  },
});

userSchema.methods.generateToken = async function () {
  this.token = await sign({ id: this._id }, process.env.PRIVATE_KEY, {
    expiresIn: 60 * 10,
  });
};

userSchema.statics.findByEmailAndPassword = async function (email, password) {
  let userObj = null;
  try {
    return new Promise(async function (resolve, reject) {
      const user = await getOne(userModel, { email: email });

      if (!user) return reject(new AppError("Incorrect credentials", 404));
      userObj = user;
      const isMatched = await compare(password, user.password);

      if (!isMatched) return reject(new AppError("Incorrect credentials", 404));
      resolve(userObj);
    });
  } catch (err) {
    reject(err);
  }
};

userSchema.pre("save", async function (next) {
  var user = this;
  // Check whether password field is modified

  try {
    if (user.isModified("password")) {
      const hashPwd = await hash(this.password, 10);
      this.password = hashPwd;
      next();
    }
  } catch (err) {
    // return res.send({msg:err.message});
    next(err);
  }
});
userSchema.pre("updateOne", function (next) {
  this.options.runValidators = true;
  next();
});
userSchema.post("save", function (error, _, next) {
  next(
    error.code === 11000
      ? new AppError("email is already registered", 403)
      : error
  );
});

const userModel = model("user", userSchema);

module.exports = userModel;
