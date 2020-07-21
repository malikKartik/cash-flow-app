const mongoose = require("mongoose");
const Team = require("../models/team");
const User = require("../models/user");
const { findOne } = require("../models/team");

exports.getTeams = (req, res, next) => {
  Team.find()
    .populate("users", "email")
    .exec()
    .then((result) => res.status(201).json(result))
    .catch((err) =>
      res.status(500).json({
        error: err,
      })
    );
};

exports.createTeam = async (req, res, next) => {
  try {
    let id = Math.floor(Math.random() * 100000000);
    let teams = await Team.find({ teamId: id });
    while (teams.length > 0) {
      id = Math.floor(Math.random() * 1000000000);
      teams = await Team.find({ teamId: id });
    }
    const team = {
      _id: mongoose.Types.ObjectId(),
      teamName: req.body.name,
      teamId: id.toString(),
      secret: Math.floor(Math.random() * 1000000).toString(),
      users: [req.body.userid],
      transactions: {
        from: [],
        to: [],
        amount: [],
      },
    };
    await User.findOneAndUpdate(
      { _id: req.body.userid },
      { $push: { teams: team._id } }
    );
    const newTeam = new Team(team);
    await newTeam.save();

    res.send(team);
  } catch (e) {
    console.log(e);
    res.send({ message: "Error!" });
  }
};

exports.addUser = (req, res, next) => {
  const teamId = req.body.teamid;
  const email = req.body.email;
  User.findOne({ email: email })
    .exec()
    .then((user) => {
      let teams = [];
      teams = user.teams;
      if (teams.includes(teamId))
        return res.send("User already a part of this team!");
      let userId = user._id;
      teams.push(teamId);
      User.findOneAndUpdate({ _id: userId }, { teams: teams })
        .exec()
        .then((resp) => {
          Team.findOneAndUpdate(
            { _id: teamId },
            { $push: { users: userId } },
            (err, team) => {
              if (err) res.status(500).json({ error: err });
              else res.json(team);
            }
          );
        });
    })
    .catch((err) => {
      res.json({ error: err });
    });
};

exports.joinTeam = (req, res, next) => {
  const teamId = req.body.teamid;
  const secret = req.body.secret;
  const userId = req.body.userid;
  Team.findOne({ teamId: teamId })
    .exec()
    .then((team) => {
      if (team == null) return res.send("Team not found");
      if (team.secret != secret) return res.send("Incorrect password");
      if (team.users.includes(userId))
        return res.send("user already exits in team");
      let users = [];
      users = team.users;
      let teamUid = team._id;
      users.push(userId);
      Team.findOneAndUpdate({ _id: team._id }, { users: users })
        .exec()
        .then((result) => {
          User.findOneAndUpdate(
            { _id: userId },
            { $push: { teams: teamUid } },
            (err, user) => {
              if (err) res.status(500).json({ error: err });
              else res.json(user);
            }
          );
        });
    })
    .catch((err) => {
      res.json({ error: err });
    });
};
