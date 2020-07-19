const mongoose = require('mongoose');
const Team = require('../models/team');
const user = require('../models/user');

exports.createTeam = async (req,res,next)=>{
    try{
        let id = Math.floor(Math.random() * 100000000);
        let teams = await Team.find({teamId:id})
        while(teams.length>0){
            id = Math.floor(Math.random() * 1000000000);
            teams = await Team.find({teamId:id})
        }
        const team = {
            _id: mongoose.Types.ObjectId(),
            teamName: req.body.name,
            teamId: id.toString,
            secret: Math.floor(Math.random() * 1000000).toString,
            users: [req.body.userid],
            transactions: {
                from: [],
                to: [],
                amount: []
            }
        }
        const newTeam = new Team(team)
        await newTeam.save()
        res.send(team)
    }catch(e){
        console.log(e)
        res.send({message:"Error!"})
    }
}

exports.getTeams = async (req,res,next) =>{
    try{
        
    }catch(e){
        console.log(e)
        res.send({message:"Error!"})
    }
}