const mysql = require('mysql2');

var mySqlDb = mysql.createConnection({
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASS,
  database: process.env.SQL_DATABASE
});

mySqlDb.connect(function(err) {
  if (err) throw err;
  console.log("MySQL Connected!");
});

const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  process.env.SQL_DATABASE,
  process.env.SQL_USER,
  process.env.SQL_PASS,
  {
    host: process.env.SQL_HOST,
    dialect: 'mysql'
  }
);

sequelize.authenticate().then(() => {
  console.log('Sequelize connection has been established successfully.');
}).catch((error) => {
  console.error('Unable to connect to the database: ', error);
});

module.exports = { mySqlDb, sequelize };