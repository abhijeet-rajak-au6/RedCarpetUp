const mongoose = require("mongoose");

const dbConnnect = async () => {
  const db =
    process.env.NODE_ENV !== "test"
      ? process.env.MONGODB_URL
      : process.env.MONGODB_URL_TEST;

  const dbcon = await mongoose.connect(
    db.replace("<password>", process.env.MONGODB_PASSWORD),
    {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
  );

  if (dbcon) console.log("Database is connected sucessfully !!");
};

dbConnnect();
