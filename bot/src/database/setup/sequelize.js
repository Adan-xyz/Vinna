const dotenv = require('dotenv'); dotenv.config();
const { Sequelize } = require('sequelize-cockroachdb');

const sequelize = new Sequelize(process.env.COCKROACHDB, {
  dialect: 'postgres',
  logging: false
});

module.exports = sequelize;