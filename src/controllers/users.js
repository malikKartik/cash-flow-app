const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User  = require('../models/user')

exports.create_a_user = (req,res,next)=>{
    User.find({email:req.body.email}).then(data=>{
        if(data.length>=1){
            return res.status(409).json({
                message:"Email exists!"
            })
        }else{
            bcrypt.hash(req.body.password,8,(err,hash)=>{
                if(err){
                    return res.status(500).json({
                        error: err
                    })
                }
                else{
                    const user = new User({
                        _id: mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                    })
                    user.save().then(data=>{
                        res.json({
                            message:'User created!',
                            id:data._id,
                            email:data.email
                        })
                    }).catch(e=>{
                        console.log(e)
                        
                    })
                    }
                })
        }
    })
}

exports.delete_a_user = (req,res,next)=>{
    User.remove({_id:req.params.userid}).then(data=>{
        res.json({
            message:"User removed successfully!"
        })
    }).catch(e=>{
        console.log(e)
        res.status(500).json({
            error: "something went wrong!"
        })
    })
}

exports.login = (req,res,next)=>{
    User.find({email:req.body.email}).then(user=>{
        if(user.length<1){
            return res.status(401).json({
                message: "Auth failed!"
            })
        }
        bcrypt.compare(req.body.password,user[0].password,(err,result)=>{
            if(result){
                const token = jwt.sign({
                    email: user[0].email,
                    userId: user[0]._id
                },process.env.JWT_KEY || "key")
                return res.json({
                    message:"Success!",
                    token: token
                })
            }
            return res.status(401).json({
                message: "Auth failed!"
            })
        })
    }).catch(e=>{
        console.log(e)
        res.status(500).json({
            error: "something went wrong!"
        })
    })
}