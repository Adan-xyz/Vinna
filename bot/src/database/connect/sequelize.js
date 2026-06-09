const sequelize = require('../setup/sequelize');

async function connect() {
  await Promise.all([sequelize.authenticate(), sequelize.sync({ alter: true })]);
  console.log('Connected to CockroachDB');
}

module.exports = { connect };