const mongoose = require('mongoose');
const dotenv = require('dotenv'); dotenv.config();

async function connect() {
  await mongoose.connect(process.env.MONGODB);
  console.log('Connected to MongoDB');
}

module.exports = { connect };