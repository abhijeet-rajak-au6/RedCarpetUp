const mongoose = require("mongoose");

const dbConnnect = async () => {
  const dbcon = await mongoose.connect(
    process.env.MONGODB_URL.replace("<password>", process.env.MONGODB_PASSWORD),
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
