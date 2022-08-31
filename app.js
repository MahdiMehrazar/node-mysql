require("dotenv").config();
const express = require("express");
const routes = require("./routes/route.js");
const passport = require("passport");
const bodyParser = require("body-parser");
var session = require("express-session");
var MySQLStore = require("express-mysql-session")(session);
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

/*Mysql Express Session*/

app.use(
  session({
    key: process.env.SESSION_NAME,
    secret: "session_cookie_secret",
    store: new MySQLStore({
      host: process.env.SQL_HOST,
      port: process.env.SQL_PORT,
      user: process.env.SQL_USER,
      database: process.env.SQL_DATABASE,
      password: process.env.SQL_PASS,
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(express.json());
app.use("/", routes);

app.use(helmet());

// Initialize Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 100 requests per windowMs
});

// Apply limiter to all requests
app.use(limiter);

module.exports = app;
