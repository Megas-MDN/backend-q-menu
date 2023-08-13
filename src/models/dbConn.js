require('dotenv/config');
const mongoose = require('mongoose');

module.exports = async () => {
  const password = process.env.PASS_DB;
  const user = process.env.USER_DB;
  const table = 'q-menu';
  const hash = 't7txc5n';
  const cluster = 'cluster0';
  const url = `mongodb+srv://${user}:${password}@${cluster}.${hash}.mongodb.net/${table}?retryWrites=true&w=majority`;
  try {
    await mongoose.connect(url);
    console.log('Successfully connected to the database!');
    return 'Db Ok';
  } catch (error) {
    console.log('Failed to connect to database');
    throw error;
  }
};
