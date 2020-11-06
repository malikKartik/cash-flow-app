const mongoose = require('mongoose');
const Team = require('../models/team');
const User = require('../models/user');
const Place = require('../models/place');
const {findOne} = require('../models/team');

exports.addTransactions = async (req, res, next) => {
  try {
    let place = new Place({
      _id: mongoose.Types.ObjectId(),
      bill: req.body.bill,
      name: req.body.placeName,
      transactions: [],
    });

    const teamId = req.body.id;
    const from = req.body.from.split(' ');
    const to = req.body.to.split(' ');
    const amount = req.body.amount.split(' ');

    const team = await Team.findOne({teamId: teamId});
    team.transactions.from = team.transactions.from.concat(from);
    team.transactions.to = team.transactions.to.concat(to);
    team.transactions.amount = team.transactions.amount.concat(amount);

    await Team.findOneAndUpdate({teamId: teamId}, team);
    res.json({message: 'SUCCESS!'});
  } catch (e) {
    console.log(e);
    res.json({message: 'ERROR!'});
  }
};

exports.removeTransactions = (req, res, next) => {
  try {
  } catch (e) {}
};
