const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    required: true,
    type: String,
  },
  route: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: { type: String, required: true, unique: true },
  menu: {
    type: Array,
    default: [],
  },
  tables: {
    type: Array,
    default: [],
  },
});

const Restaurant = mongoose.model('Restaurant', schema);
module.exports = Restaurant;
