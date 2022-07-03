const mysql = require('mysql2');

var con = mysql.createConnection({
  host: "localhost",
  user: process.env.SQL_USER,
  password: process.env.SQL_PASS,
  database: "nodesql"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("MySQL Connected!");
});

module.exports = con;