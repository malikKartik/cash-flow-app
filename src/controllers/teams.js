const mongoose = require('mongoose')
const Team = require('../models/team')

exports.createTeam = (req,res,next)=>{
    res.send("Created!")
}