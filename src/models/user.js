const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: {type: String, required: true, unique: true},
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  // TODO-I: make phone reuired:true
  phone: {type: Number},
  firstName: String,
  lastName: String,
  teams: [{type: mongoose.Schema.Types.ObjectId, ref: 'Team'}],
  image: String,
});

module.exports = mongoose.model('User', userSchema);
