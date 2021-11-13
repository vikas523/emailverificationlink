const jwt = require('jsonwebtoken')
const cookie = require('cookie-parser')
const User = require('../models/userModel')



const loginrequired = async(req,res,next)=>{
    const token = req.cookies['access-token']
    if(token){
        const validatoken = await jwt.verify(token,process.env.JWT_SECRET)
        if(validatoken){
            req.user=validatoken.id
            next()
        }
        else{
            console.log('token expires');
            res.redirect('/user/login')
        }
    }
    else{
        console.log('token not found');
        res.redirect('/user/login')
    }
}


const  verifyEmail=async(req,res,next)=>{
    try {
        const user = await User.findOne({ email : req.body.email })
        if(user.isVerified){
            next()
        }else{
            console.log("please check ur email to verify your account");
        }
    } catch (error) {
        console.log(error);
    }
}



module.exports={loginrequired,verifyEmail}