const { Schema, model } = require("mongoose");
const { sign, verify } = require("jsonwebtoken");
const { compare, hash } = require("bcryptjs");

const userSchema = Schema({
  name: {
    type: String,
    required: [true, "Please provide your name"],
  },
  phone: {
    type: String,
    required: [true, "Please enter your phone"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please enter your email"],
  },
  password:{
      type:String,
      required:[true,'Please provide password']
  },
  token: {
    type: String,
    default: null,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    default: null,
  },
});

userSchema.methods.generateToken = async function () {
  this.token = await sign({ id: this._id }, process.env.PRIVATE_KEY, {
    expiresIn: 60 * 90,
  });
};

userSchema.statics.findByEmailAndPassword = async function (email, password) {
  let userObj = null;
  try {
    return new Promise(async function (resolve, reject) {
      const user = await userModel.find({ email: email });
    //   console.log('user',user);
      console.log('password',password);
      if (user.length === 0) return reject("Incorrect credentials");
      userObj = user;
      const isMatched = await compare(password, user[0].password);

      if (!isMatched) return reject("Incorrect credentials");
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
    console.log(err);
    next(err);
  }
});

const userModel = model("user", userSchema);

module.exports = userModel;
