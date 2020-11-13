const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const User = require('../models/user');
const successCodes = require('../responseCodes/successCodes').successCodes;
const errorCodes = require('../responseCodes/errorCodes').errorCodes;

let otpMap = new Map();

exports.getUsers = (req, res, next) => {
  User.find()
    .populate('teams')
    .exec()
    .then((result) => res.status(201).json(result))
    .catch((err) =>
      res.status(errorCodes.INTERNAL_SERVER_ERROR.status).json({
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
        return res.status(errorCodes.SU_EMAIL_EXISTS.status).json({
          ...errorCodes.SU_EMAIL_EXISTS,
        });
      } else {
        bcrypt.hash(req.body.password, 8, (err, hash) => {
          if (err) {
            res.status(errorCodes.INTERNAL_SERVER_ERROR.status).json({
              ...errorCodes.INTERNAL_SERVER_ERROR,
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
                res.status(successCodes.SIGNUP.status).json({
                  ...successCodes.SIGNUP,
                  id: data._id,
                  email: data.email,
                });
              })
              .catch((e) => {
                res.status(errorCodes.INTERNAL_SERVER_ERROR.status).json({
                  ...errorCodes.INTERNAL_SERVER_ERROR,
                });
              });
          }
        });
      }
    });
  } else {
    res.status(errorCodes.SU_INCORRECT_OTP.status).json({
      ...errorCodes.SU_INCORRECT_OTP,
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
      res.status(errorCodes.INTERNAL_SERVER_ERROR.status).json({
        error: 'something went wrong!',
      });
    });
};

exports.login = (req, res, next) => {
  User.find({$or: [{email: req.body.username}, {username: req.body.username}]})
    .populate('teams', 'teamName teamId secret')
    .then((user) => {
      if (user.length < 1) {
        console.log({...errorCodes.LI_FAILURE});
        return res.status(errorCodes.LI_FAILURE.status).json({
          ...errorCodes.LI_FAILURE,
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
            ...successCodes.LOGIN,
          });
        }
        return res.status(errorCodes.LI_FAILURE.status).json({
          ...errorCodes.LI_FAILURE,
        });
      });
    })
    .catch((e) => {
      console.log(e);
      res.status(errorCodes.INTERNAL_SERVER_ERROR.status).json({
        ...errorCodes.INTERNAL_SERVER_ERROR,
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
      res.status(errorCodes.INTERNAL_SERVER_ERROR.status).json({
        error: err,
      }),
    );
};

exports.validate = async (req, res, next) => {
  try {
    const token = req.body.token;
    if (!token)
      res
        .status(errorCodes.NOT_AUTHORIZED.status)
        .send({...errorCodes.NOT_AUTHORIZED});
    const decoded = jwt.verify(token, process.env.JWT_KEY || 'key');
    const userId = decoded.userId;
    const user = await User.find({_id: userId}).populate(
      'teams',
      'teamName teamId secret',
    );
    res.status(successCodes.VALIDATE.status).send({
      email: user[0].email,
      userId: user[0]._id,
      username: user[0].username,
      firstName: user[0].firstName,
      lastName: user[0].lastName,
      teams: user[0].teams,
      token,
      ...successCodes.VALIDATE,
    });
  } catch (err) {
    res
      .status(errorCodes.NOT_AUTHORIZED.status)
      .send({...errorCodes.NOT_AUTHORIZED});
  }
};
exports.logout = (req, res, next) => {
  res.clearCookie('jwt');
  res.status(successCodes.LOGOUT.status).json({...successCodes.LOGOUT});
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
      res
        .status(errorCodes.INTERNAL_SERVER_ERROR.status)
        .json({...errorCodes.INTERNAL_SERVER_ERROR});
      console.log(error);
    } else {
      res.status(successCodes.SEND_OTP.status).json({...successCodes.SEND_OTP});
    }
  });
};

exports.getTeams = (req, res, next) => {
  User.findById(req.body.id)
    .populate('teams')
    .then((user) => {
      req
        .status(successCodes.GET_TEAMS.status)
        .json({...successCodes.GET_TEAMS});
    })
    .catch((err) => {
      res
        .status(errorCodes.INTERNAL_SERVER_ERROR.status)
        .json({...errorCodes.INTERNAL_SERVER_ERROR});
    });
};
