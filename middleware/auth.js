const db = require("../config/database").mySqlDb;

// importing sequelize model
const Users = require("../models/book.model").Users;

function userExists(req, res, next) {
  Users.findOne({
    where: {
      username: req.body.username,
    },
  })
    .then((results) => {
      if (results) {
        res.send("User already exists");
      } else {
        next();
      }
    })
    .catch((error) => {
      res.send("Error");
    });
}

function isAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.send("You are not authenticated. Please login first.");
  }
}

exports.userExists = userExists;
exports.isAuth = isAuth;
