const moment = require("moment");
const offset = new Date().getTimezoneOffset();
const { verify } = require("jsonwebtoken");
console.log(offset);

console.log(new Date());

console.log(moment(new Date()).utcOffset(120).format("DD MM YYYY hh:mm:ss"));

token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwMmZjZTkxNzEzYTNiNjJlNTEyMTZiMyIsImlhdCI6MTYxNDI2MTY1MiwiZXhwIjoxNjE0MjYyMjUyfQ.AmABizF5ua2TRn8nFD69ZJHx9L6RztYP_zwDuHOAqeg";

const val = verify(token, "DEVCONNECTOR");
console.log(val);
console.log(new Date(1614261652 * 1000));
