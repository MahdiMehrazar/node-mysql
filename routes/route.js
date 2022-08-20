const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

router.post("/createdb", userController.createDb);

router.post("/createusers", userController.createUsers);

router.post("/register", userController.register);

router.post("/login", userController.login);

router.post("/welcome", auth, userController.welcome);

module.exports = router;