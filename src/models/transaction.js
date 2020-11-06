const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  to: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  from: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  amount: {type: Number, required: true},
});

module.exports = mongoose.model('Transaction', transactionSchema);
