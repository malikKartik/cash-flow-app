const mongoose = require('mongoose');
const Place = require('../models/place');

exports.getTransactions = (req, res, next) => {
  Place.findById(req.body.id)
    .populate('transactions')
    .populate({
      path: 'transactions',
      populate: {
        path: 'from',
        model: 'User',
      },
    })
    .populate({
      path: 'transactions',
      populate: {
        path: 'to',
        model: 'User',
      },
    })
    .then((data) => {
      console.log(data);
      res.status(200).json(data);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};

exports.settleAllTransactions = async (req, res, next) => {
  try {
    let place = await Place.findById(req.body.id).populate('transactions');
    await place.transactions.forEach((element) => {
      console.log(element);
      element.settled = true;
      element.save();
    });
    res.status(200).json(place);
  } catch (err) {
    console.log(err);
    res.status(500).json({error: err});
  }
};
