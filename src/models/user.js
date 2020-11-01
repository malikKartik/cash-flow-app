const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: {type: String, required: true, unique: true},
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  firstName: String,
  lastName: String,
  teams: [{type: mongoose.Schema.Types.ObjectId, ref: 'Team'}],
});

module.exports = mongoose.model('User', userSchema);
