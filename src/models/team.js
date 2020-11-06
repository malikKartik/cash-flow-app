const mongoose = require('mongoose');

const teamSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  teamName: {
    type: String,
    required: true,
  },
  teamId: {
    type: String,
    required: true,
    unique: true,
  },
  secret: {type: String, required: true},
  users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  places: [{type: mongoose.Schema.Types.ObjectId, ref: 'Place'}],
});

module.exports = mongoose.model('Team', teamSchema);
