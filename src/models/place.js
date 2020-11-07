const mongoose = require('mongoose');

const placeSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  bill: String,
  name: {type: String, required: true},
  transactions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Transaction'}],
});

module.exports = mongoose.model('Place', placeSchema);
