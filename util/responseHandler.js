const { response } = require("express");

class Response {
  constructor(message, statusCode, data = "") {
    this.data = data;
    this.message = message;
    this.statusCode = statusCode;
  }
}

module.exports = Response;
