const crypto = require("crypto");
const LocalStrategy = require("passport-local").Strategy;
const passport = require("passport");
// Winston logger
const logger = require('../utils/logger');


// importing MySQL db
const db = require("../config/database");

// Create MySQL database
exports.createDb = async (req, res) => {
  let sql = "CREATE DATABASE nodesql";

  db.query(sql, (err) => {
    if (err) {
      throw err;
    }

    logger.info(`database created`);
    res.send("Database created");
  });
};

// Create users table
exports.createUsers = async (req, res) => {
  let sql =
    "CREATE TABLE users(id INT NOT NULL AUTO_INCREMENT, username VARCHAR(45) NOT NULL, hash VARCHAR(200) NOT NULL, salt VARCHAR(255) NOT NULL, isAdmin TINYINT(4) NOT NULL, PRIMARY KEY (id))";

  db.query(sql, (err) => {
    if (err) {
      throw err;
    }
  
    logger.info(`users table created`);
    res.send("Users table created");
  });
};

exports.welcome = async (req, res) => {
  res
    .status(200)
    .send(`Welcome ${req.user.username}`);
};

exports.loginFailure = async (req, res) => {
  res.send("Invalid username or password");
};

exports.loginSuccess = async (req, res) => {
  logger.info(`user ${req.user.username} logged in successfully`);
  res.send("Logged in successfully!");
};

exports.register = async (req, res) => {
  console.log(req);
  const saltHash = genPassword(req.body.password);
  console.log(saltHash);
  const salt = saltHash.salt;
  const hash = saltHash.hash;

  db.query(
    "Insert into users(username,hash,salt,isAdmin) values(?,?,?,0) ",
    [req.body.username, hash, salt],
    function (error, results, fields) {
      if (error) {
        logger.error(`user registration failure ${req.body.username}`);
        res.send("Error registering");
      } else {
        logger.info(`new user registered ${req.body.username}`);
        res.send("Successfully Registered");
      }
    }
  );
};

exports.logout = async (req, res) => {
  req.logout(function (err) {
    if (err) {
      res.send("Error logging out");
    }
    res.send("Logged out.");
  });
};

/*Passport JS*/
const verifyCallback = (username, password, done) => {
  db.query(
    "SELECT * FROM users WHERE username = ? ",
    [username],
    function (error, results, fields) {
      if (error) return done(error);

      if (results.length == 0) {
        return done(null, false);
      }
      const isValid = validPassword(password, results[0].hash, results[0].salt);
      user = {
        id: results[0].id,
        username: results[0].username,
        hash: results[0].hash,
        salt: results[0].salt,
      };
      if (isValid) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    }
  );
};

const customFields = {
  usernameField: "username",
  passwordField: "password",
};

const strategy = new LocalStrategy(customFields, verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(function (userId, done) {
  db.query(
    "SELECT * FROM users where id = ?",
    [userId],
    function (error, results) {
      done(null, results[0]);
    }
  );
});

function validPassword(password, hash, salt) {
  var hashVerify = crypto
    .pbkdf2Sync(password, salt, 10000, 60, "sha512")
    .toString("hex");
  return hash === hashVerify;
}

function genPassword(password) {
  var salt = crypto.randomBytes(32).toString("hex");
  var genhash = crypto
    .pbkdf2Sync(password, salt, 10000, 60, "sha512")
    .toString("hex");
  return { salt: salt, hash: genhash };
}
