const crypto = require("crypto");
const LocalStrategy = require("passport-local").Strategy;
const passport = require("passport");
// Winston logger
const logger = require("../utils/logger");

// importing MySQL db
const db = require("../config/database").mySqlDb;

// importing sequelize model
const Users = require("../models/book.model").Users;

// Create MySQL database
exports.createDb = async (req, res) => {
  let sql = "CREATE DATABASE IF NOT EXISTS nodesql";

  db.query(sql, (err) => {
    if (err) {
      throw err;
    }

    logger.info(`database created`);
    res.send("Database created");
  });
};

exports.welcome = async (req, res) => {
  res.status(200).send(`Welcome ${req.user.username}`);
};

exports.loginFailure = async (req, res) => {
  res.send("Invalid username or password");
};

exports.loginSuccess = async (req, res) => {
  logger.info(`user ${req.user.username} logged in successfully`);
  res.send("Logged in successfully!");
};

exports.register = async (req, res) => {
  const saltHash = genPassword(req.body.password);
  const salt = saltHash.salt;
  const hash = saltHash.hash;

  Users.create({
    username: req.body.username,
    hash: hash,
    salt: salt,
    isAdmin: 0,
  })
    .then(() => {
      logger.info(`new user registered ${req.body.username}`);
      res.send("Successfully Registered");
    })
    .catch((error) => {
      logger.error(
        `user registration failure ${req.body.username} with error ${error}`
      );
      res.send("Error registering");
    });
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
  Users.findOne({
    where: {
      username: username,
    },
  })
    .then((results) => {
      if (results.length == 0) {
        return done(null, false);
      }

      const isValid = validPassword(
        password,
        results.dataValues.hash,
        results.dataValues.salt
      );
      user = {
        id: results.dataValues.id,
        username: results.dataValues.username,
        hash: results.dataValues.hash,
        salt: results.dataValues.salt,
      };
      if (isValid) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    })
    .catch((error) => {
      return done(error);
    });
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
  Users.findOne({
    where: {
      id: userId,
    },
  })
    .then((results) => {
      done(null, results.dataValues);
    })
    .catch((error) => {
      error(error);
    });
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
