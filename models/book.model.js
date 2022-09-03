const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database").sequelize;

exports.Users = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    salt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

sequelize
  .sync()
  .then(() => {
    console.log("Users table created successfully or already exists!");
  })
  .catch((error) => {
    console.error("Unable to create table : ", error);
  });
