const mongoose = require('./connect/mongoose');
const sequelize = require('./connect/sequelize');

async function connect() {
  try {
    await mongoose.connect();
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }

  try {
    await sequelize.connect();
  } catch (error) {
    console.error('Error connecting to CockroachDB:', error);
  }
}

module.exports = { connect };