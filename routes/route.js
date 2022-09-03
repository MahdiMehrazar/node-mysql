const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const passport = require("passport");

router.post("/createdb", userController.createDb);

router.post("/register", auth.userExists, userController.register);

router.get("/login-failure", userController.loginFailure);

router.get("/login-success", userController.loginSuccess);

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login-failure",
    successRedirect: "/login-success",
  })
);

router.get("/logout", userController.logout);

router.post("/welcome", auth.isAuth, userController.welcome);

module.exports = router;
