const mongoose = require('mongoose');
const Team = require('../models/team');
const User = require('../models/user');
const Place = require('../models/place');
const Transaction = require('../models/transaction');
const {findOne} = require('../models/team');

exports.addTransactions = async (req, res, next) => {
  try {
    let transactions = [];
    let transactionIds = [];
    req.body.transactions.forEach((transaction) => {
      const tempTrans = new Transaction({
        _id: mongoose.Types.ObjectId(),
        from: transaction.from,
        to: transaction.to,
        amount: transaction.amount,
        settled: false,
      });
      transactionIds.push(tempTrans._id);
      transactions.push(tempTrans);
    });

    let place = new Place({
      _id: mongoose.Types.ObjectId(),
      bill: req.body.bill,
      name: req.body.placeName,
      transactions: transactionIds,
    });

    await Team.findByIdAndUpdate(req.body.teamId, {$push: {places: place._id}});
    await place.save();
    await Transaction.insertMany(transactions);
    return res.send({place, transactions: transactions});
  } catch (e) {
    if (e) {
      console.log(e);
      return res.json({message: 'ERROR!'});
    }
  }
};

exports.removeTransactions = (req, res, next) => {
  try {
  } catch (e) {}
};
