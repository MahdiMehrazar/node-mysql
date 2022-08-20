const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// importing MySQL db
const db = require("../config/database");

// Winston logger
const logger = require("../utils/logger");

// Create MySQL database
exports.createDb = async (req, res) => {
  let sql = "CREATE DATABASE nodesql";

  db.query(sql, (err) => {
    if (err) {
      throw err;
    }

    res.send("Database created");
  });
};

// Create users table
exports.createUsers = async (req, res) => {
  let sql =
    "CREATE TABLE users(user_id INT NOT NULL AUTO_INCREMENT, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, user_password VARCHAR(255) NOT NULL, PRIMARY KEY (user_id))";

  db.query(sql, (err) => {
    if (err) {
      throw err;
    }

    res.send("Users table created");
  });
};

// Register
exports.register = async (req, res) => {
  try {
    // Get user input
    const { first_name, last_name, email, user_password } = req.body;

    // Validate user input
    if (!(email && user_password && first_name && last_name)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    sql = `SELECT 1 FROM users WHERE email = '${email}'`;

    db.query(sql, (err, results) => {
      if (err) {
        throw err;
      }
      if (results.length > 0) {
        res.status(409).send("Users already exists. Please login.");
      } else {
        //Encrypt user password
        bcrypt.hash(user_password, 10, (err, hash) => {
          if (err) {
            return res.status(500).send({
              msg: err,
            });
          } else {
            db.query(
              `INSERT INTO users (first_name, last_name, email, user_password) VALUES ('${first_name}', '${last_name}', ${db.escape(
                email
              )}, ${db.escape(hash)})`,
              (err, result) => {
                if (err) {
                  throw err;
                }

                // log user registered
                logger.info(`new user registered ${first_name} ${last_name}`);

                return res.status(201).send({
                  msg: "User has been registered.",
                });
              }
            );
          }
        });
      }
    });
  } catch (err) {
    // log user registration error
    logger.error("Important error: ", new Error("user registration failure"));
  }
};

// Login
exports.login = async (req, res) => {
  try {
    // Get user input
    const { email, user_password } = req.body;

    // Validate user input
    if (!(email && user_password)) {
      res.status(400).send("All input is required");
    }

    // Validate if user exist in our database
    sql = `SELECT * FROM users WHERE email = '${email}'`;

    db.query(sql, (err, result) => {
      // User does not exist
      if (err) {
        throw err;
      }
      if (!result.length) {
        return res.status(401).send({
          msg: "Email or password is incorrect!",
        });
      }
      console.log(result);
      // Check password
      bcrypt.compare(
        user_password,
        result[0]["user_password"],
        (bErr, bResult) => {
          if (bErr) {
            return res.status(401).send({
              msg: "Email or password is incorrect!",
            });
          }
          if (bResult) {
            // Create token
            const token = jwt.sign(
              { user_id: result[0].id, email },
              process.env.TOKEN_KEY,
              {
                expiresIn: "1h",
              }
            );

            return res.status(200).send({
              msg: "Logged in!",
              token,
              user: result[0],
            });
          }
          return res.status(401).send({
            msg: "Username or password is incorrect!",
          });
        }
      );
    });
  } catch (err) {
    logger.error("Important error: ", new Error("user login failure"));
  }
};

exports.welcome = async (req, res) => {
  sql = `SELECT * FROM users where email='${res.req.user.email}'`;
  db.query(sql, function (error, results) {
    if (error) throw error;

    res
      .status(200)
      .send(`Welcome ${results[0].first_name} ${results[0].last_name}`);
  });
};
