const express = require('express')
const app = express();
const PORT = process.env.PORT || 8000
const dotenv = require('dotenv').config()
const mongoose = require('mongoose')
const hbs = require('hbs')
const {urlencoded}= require('express')
const cookieparser = require('cookie-parser')
const bodyParser = require('body-parser')



const userRoute = require('./routes/user')
const homeRoute = require('./routes/home')

// middleware
app.use(urlencoded({extended:false}));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieparser())
app.use(express.json())


// set templet engine
app.set('view engine','hbs')

// db connect
mongoose.connect(process.env.MONGODB_URL,{})
.then((connect)=>{
    console.log("db is connected");
})
.catch(err=>{
    console.log((err));
})


// routes
app.use('/',homeRoute)
app.use('/user',userRoute)



app.listen(PORT,()=>{
    console.log(`listening on port ${PORT}...`);
})
module.exports=app;