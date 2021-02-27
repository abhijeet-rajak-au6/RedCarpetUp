const { Router } = require("express");
const upload = require("../multer");
const { executeValidation } = require("../middleware/executeValidation");
// const { checkRegistration  } = require('../middleware/checkUser');
const {
  register,
  login,
  logout,
  listAllUsers,
  editUser,
} = require("../Controller/userController");
const { checkValidation } = require("../middleware/validate");
const { authenticate } = require("../middleware/authentication");
const { authorized } = require("../middleware/authorization");
const { Send } = require("../middleware/Send");

const router = Router();

router.post("/api/v1/register", [
  checkValidation("USER_REGISTRATION"),
  executeValidation,
  register,
  Send,
]);
router.post("/api/v1/login", [
  checkValidation("USER_LOGIN"),
  executeValidation,
  login,
  Send,
]);
router.delete("/api/v1/logout", [authenticate, logout, Send]);
router.get("/api/v1/user/list-all-user", [
  authenticate,
  authorized("admin", "agent"),
  listAllUsers,
  Send,
]);

router.patch("/api/v1/user/edit-user/:id", [
  authenticate,
  authorized("admin", "agent"),
  editUser,
  Send,
]);

module.exports = router;
