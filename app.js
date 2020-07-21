const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

const {MONGO_URI} = require('./src/config/mongodb')

const app = express();
app.use(express.urlencoded({extended:false}))
app.use(express.json())

mongoose.connect(MONGO_URI)

app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*')
    res.header('Access-Control-Allow-Headers','*')
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT,POST,PATCH,DELETE,GET')
        return res.status(200).json({})
    }
    next()
})

const userRoutes = require('./src/routes/users')
const teamRoutes = require('./src/routes/teams')
const transactionRoutes = require('./src/routes/transactions')
app.use(morgan('dev'));

// All end points
app.use('/uploads',express.static('uploads'))
app.use('/api/users',userRoutes)
app.use('/api/teams',teamRoutes)
app.use('/api/transactions',transactionRoutes)
// Handling errors
app.use((req,res,next)=>{
    const error = new Error('Not found!')
    error.status = 404
    next(error)
})

app.use((error,req,res,next)=>{
    res.status(error.status||500)
    res.json({
        error:{
            message: error.message
        }
    })
})

module.exports = app