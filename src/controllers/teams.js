const mongoose = require('mongoose');
const Team = require('../models/team');
const User = require('../models/user');
const io = require('../../app').io;

exports.getTeams = (req, res, next) => {
  Team.find()
    .populate('users', 'email')
    .exec()
    .then((result) => res.status(201).json(result))
    .catch((err) =>
      res.status(500).json({
        error: err,
      }),
    );
};

exports.createTeam = async (req, res, next) => {
  try {
    let id = Math.floor(Math.random() * 100000000);
    let teams = await Team.find({teamId: id});
    while (teams.length > 0) {
      id = Math.floor(Math.random() * 1000000000);
      teams = await Team.find({teamId: id});
    }
    const team = {
      _id: mongoose.Types.ObjectId(),
      teamName: req.body.name,
      teamId: id.toString(),
      secret: Math.floor(Math.random() * 1000000).toString(),
      users: [req.body.userId],
      transactions: {},
    };
    await User.findOneAndUpdate(
      {_id: req.body.userId},
      {$push: {teams: team._id}},
    );
    const newTeam = new Team(team);
    await newTeam.save();

    res.send(team);
  } catch (e) {
    console.log(e);
    res.send({message: 'Error!'});
  }
};

exports.addUser = (req, res, next) => {
  const teamId = req.body.teamid;
  User.findOne({
    $or: [{email: req.body.username}, {username: req.body.username}],
  })
    .exec()
    .then((user) => {
      console.log(user);
      let teams = [];
      teams = user.teams;
      if (teams.includes(teamId))
        return res.json({message: 'User already a part of this team!'});
      let userId = user._id;
      teams.push(teamId);
      User.findOneAndUpdate({_id: userId}, {teams: teams})
        .exec()
        .then((resp) => {
          Team.findOneAndUpdate(
            {_id: teamId},
            {$push: {users: userId}},
            (err, team) => {
              if (err) res.status(500).json({error: err});
              else {
                res.json(user);
                io.to(userId).emit('notification', {
                  type: 'ADDED_TO_TEAM',
                  data: {
                    teamName: team.teamName,
                    message: 'You have been added to a team.',
                  },
                });
              }
            },
          );
        });
    })
    .catch((err) => {
      res.json({error: err});
    });
};

exports.joinTeam = (req, res, next) => {
  const teamId = req.body.teamid;
  const secret = req.body.secret;
  const userId = req.body.userid;
  Team.findOne({teamId: teamId})
    .exec()
    .then((team) => {
      if (team == null) return res.send('Team not found');
      if (team.secret != secret) return res.send('Incorrect password');
      if (team.users.includes(userId))
        return res.send('user already exits in team');
      let users = [];
      users = team.users;
      let teamUid = team._id;
      users.push(userId);
      Team.findOneAndUpdate({_id: team._id}, {users: users})
        .exec()
        .then((result) => {
          User.findOneAndUpdate(
            {_id: userId},
            {$push: {teams: teamUid}},
            (err, user) => {
              if (err) res.status(500).json({error: err});
              else res.json(result);
            },
          );
        });
    })
    .catch((err) => {
      res.json({error: err});
    });
};

exports.getTeamById = (req, res, next) => {
  Team.findById(req.body.id)
    .populate('users', '_id username firstName lastName')
    .populate('places')
    .populate({
      path: 'places',
      populate: {
        path: 'transactions',
        model: 'Transaction',
      },
    })
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
};
