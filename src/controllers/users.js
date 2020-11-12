const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const User = require('../models/user');
const successCodes = require('../responseCodes/successCodes').successCodes;

let otpMap = new Map();

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
  if (req.body.otp == otpMap.get(req.body.email)) {
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
  } else {
    res.json({
      message: 'Incorrect OTP!',
    });
  }
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
  User.find({$or: [{email: req.body.username}, {username: req.body.username}]})
    .populate('teams', 'teamName teamId secret')
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
          return res.status(successCodes.LOGIN.status).json({
            token: token,
            email: user[0].email,
            userId: user[0]._id,
            username: user[0].username,
            firstName: user[0].firstName,
            lastName: user[0].lastName,
            teams: user[0].teams,
            MESSAGE: successCodes.LOGIN.message,
            CODE: successCodes.LOGIN.code,
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
    const user = await User.find({_id: userId}).populate(
      'teams',
      'teamName teamId secret',
    );
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

exports.sendOtp = (req, res, next) => {
  let otp = Math.floor(Math.random() * 100000000);
  otpMap.set(req.body.email, otp);
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'thecashflowapp@gmail.com',
      pass: 'jmqstpokoibexbil',
    },
  });

  const mailOptions = {
    from: 'thecashflowapp@gmail.com',
    to: req.body.email,
    subject: 'CashFlow one time password',
    text: 'Your one time password is ' + otp,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.status(500).json(error);
      console.log(error);
    } else {
      res.status(200).json(info.response);
    }
  });
};

exports.getTeams = (req, res, next) => {
  User.findById(req.body.id)
    .populate('teams')
    .then((user) => {
      req.status(200).json(user.teams);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};
