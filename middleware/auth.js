const db = require("../config/database");

function userExists(req, res, next) {
  db.query(
    "Select * from users where username=? ",
    [req.body.username],
    function (error, results, fields) {
      if (error) {
        res.send("Error");
      } else if (results.length > 0) {
        res.send("User already exists");
      } else {
        next();
      }
    }
  );
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
