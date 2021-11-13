const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User= require('../models/userModel')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt =require('jsonwebtoken')
const cookie = require('cookie-parser')
const nodemailer = require('nodemailer')
const {verifyEmail} = require('../config/JWT')
const bodyParser = require('body-parser')







router.get('/register',(req,res)=>{
    res.render('register')
})


// mail sender deatials
var transporter = nodemailer.createTransport({
    host:"smtp.gmail.com",
    port: 587,
    secure:false,
    requireTLS:true,
    auth : {
        user:'your account usename',
        pass:'your password'
    },
    // tls:{
    //     rejectUnauthorized : false
    // }
})




router.post('/register',async(req,res)=>{
    try {
  const{name, email, password }= req.body
  const user = new User({
      name,
      email,
      password,
      emailToken:crypto.randomBytes(64).toString('hex'),
      isVerified:false
  })
  const salt = await bcrypt.genSalt(10)
  const hashpassword = await bcrypt.hash(user.password,salt)
  user.password=hashpassword
   const newUser= await user.save()


//    send verification mail to user

var mailOption = {
    from:'"verify your email"<swainvikas1997@gmail.com>',
    to:user.email,
    subject:'verify ur email',
    html:`<h2>${user.name}! thanks for registering ur site </h2>
         <h4> please verify your email to continue...</h4>
         <a href="http://${req.headers.host}/user/verify-email?token=${user.emailToken}">verify ur email</a> `
}

// sending mail
 transporter.sendMail(mailOption,function(error,info){
     if(error){
         console.log(error);
     }else{
         console.log('verification email is sent to ur gmail account');
     }
 })
  res.redirect('/user/login')    
    } catch (error) {
        console.log(error);
    }
})

//  routes for verifyemail
router.get('/verify-email',async(req,res)=>{
    try {
        // console.log(req.);
        const token = req.query.token
        console.log("token", token)
        const user = await User.findOne({emailToken:token})
        console.log("user", user)
        // console.log(token);
        
        if(user){
            user.emailToken = null
            user.isVerified = true
            await user.save()
           
            res.redirect('/user/login')
        }else{
            res.redirect('/user/register')
            console.log('email is not verified');
        }

    } catch (error) {
        console.log(error);
    }
})



router.get('/login',(req,res)=>{
    res.render('login')
})


const createToken = (id)=>{
    return jwt.sign({ id },process.env.JWT_SECRET)
}




router.post('/login',verifyEmail,async(req,res)=>{
    try {
        const{email, password} =req.body
        const note = await User.findOne({email:email})
        if(note){
           const match = await bcrypt.compare(password,note.password)
           if(match){
            //    create tooken
            const token = createToken(note.id)
            console.log(token);
            // store token in cookie
            res.cookie('access-token',token)

             res.redirect('/dashboard')
           }else{
               console.log('invalid password');
           }
        }
        else{
            console.log('user not registered');
        }
        
    } catch (error) {
        console.log(error);
    }
})




module.exports=router
