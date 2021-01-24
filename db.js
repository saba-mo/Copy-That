// The purpose of this module is to bring your Sequelize instance (`db`) together
// with your models, for which you'll find some blank files in this directory:

const Sequelize = require("sequelize");
const pkg = require("./package.json");
const chalk = require("chalk");

const dbName = process.env.NODE_ENV === "test" ? `${pkg.name}_test` : pkg.name;
console.log(chalk.yellow(`Opening database connection to ${dbName}`));

const db = new Sequelize(`postgres://localhost:5432/${dbName}`, {
  logging: false,
});

const Copy = db.define("copy", {
  text: {
    type: Sequelize.TEXT,
  },
});

module.exports = {
  db,
  Copy,
};
