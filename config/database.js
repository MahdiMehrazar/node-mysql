const mysql = require('mysql2');

var con = mysql.createConnection({
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASS,
  database: process.env.SQL_DATABASE
});

con.connect(function(err) {
  if (err) throw err;
  console.log("MySQL Connected!");
});

module.exports = con;