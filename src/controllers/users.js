const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.getUsers = (req, res, next) => {
  User.find()
    .populate('teams')
    .exec()
    .then((result) => res.status(201).json(result))
    .catch((err) =>
      res.status(500).json({
        error: err,
      }),
    );
};

exports.create_a_user = (req, res, next) => {
  User.find({
    $or: [{email: req.body.email}, {username: req.body.usename}],
  }).then((data) => {
    if (data.length >= 1) {
      return res.status(409).json({
        message: 'Email exists!',
      });
    } else {
      bcrypt.hash(req.body.password, 8, (err, hash) => {
        if (err) {
          return res.status(500).json({
            error: err,
          });
        } else {
          const user = new User({
            _id: mongoose.Types.ObjectId(),
            email: req.body.email,
            password: hash,
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
          });
          user
            .save()
            .then((data) => {
              res.json({
                message: 'User created!',
                id: data._id,
                email: data.email,
              });
            })
            .catch((e) => {
              console.log(e);
            });
        }
      });
    }
  });
};

exports.delete_a_user = (req, res, next) => {
  User.remove({_id: req.params.userid})
    .then((data) => {
      res.json({
        message: 'User removed successfully!',
      });
    })
    .catch((e) => {
      console.log(e);
      res.status(500).json({
        error: 'something went wrong!',
      });
    });
};

exports.login = (req, res, next) => {
  console.log(req.body);
  User.find({$or: [{email: req.body.username}, {username: req.body.username}]})
    .populate('teams')
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: 'Auth failed!',
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (result) {
          const token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id,
            },
            process.env.JWT_KEY || 'key',
          );
          res.cookie('jwt', token, {
            httpOnly: true,
          });
          return res.json({
            token: token,
            email: user[0].email,
            userId: user[0]._id,
            username: user[0].username,
            firstName: user[0].firstName,
            lastName: user[0].lastName,
            teams: user[0].teams,
            message: 'Success!',
          });
        }
        return res.status(401).json({
          message: 'Auth failed!',
        });
      });
    })
    .catch((e) => {
      console.log(e);
      res.status(500).json({
        error: 'something went wrong!',
      });
    });
};

exports.getMyTeams = (req, res, next) => {
  const tok = req.body.token;
  const userId = jwt.decode(tok).userId;
  User.findById({_id: userId})
    .populate('teams', 'teamName')
    .exec()
    .then((result) => res.status(201).json(result.teams))
    .catch((err) =>
      res.status(500).json({
        error: err,
      }),
    );
};

exports.validate = async (req, res, next) => {
  try {
    const token = req.body.token;
    if (!token) res.status(401).send({error: 'Not authorized!'});
    const decoded = jwt.verify(token, process.env.JWT_KEY || 'key');
    const userId = decoded.userId;
    const user = await User.find({_id: userId});
    res.send({
      email: user[0].email,
      userId: user[0]._id,
      username: user[0].username,
      firstName: user[0].firstName,
      lastName: user[0].lastName,
      teams: user[0].teams,
      token,
    });
  } catch (err) {
    res.status(401).send({error: 'Not authorized!'});
  }
};

exports.logout = (req, res, next) => {
  res.clearCookie('jwt');
  res.json({message: 'Success!'});
};
