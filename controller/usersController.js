const express = require("express")
const {Users} = require("../database/db")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const {asyncErrorHandler} = require("../errorHandler/asyncerrorhandler")
require("dotenv").config()


const router = express.Router();
router.use(express.json())

module.exports.getAUserWithEvent =  asyncErrorHandler(async function(req, res){
    //finding a user with all his events, excluding the users who both the tickets
    const userId = await Users.findById({_id: req.params._id}, "-tickets").populate("events")
    if(!userId) return res.status(404).json({data: null, success: true, message: "user not found"})
    res.status(200).json({data: userId, success: true, message: "this is a user and all his events"})
    // res.send("this is a user and all his events")
})

module.exports.createAUser = asyncErrorHandler(async function(req, res){
    //extract password from the request body
    const {password, ...others} = req.body
    if(password.length < 6  || password.length > 15) return res.json({message : "password length must be less than 15 and greater than 5", success : false})
    //hash the password
    const hashedpassword = await bcrypt.hash(password, 10)
    //create user and store the hashed password to database
    const user = await Users.create({...others, password: hashedpassword})
    //generate the json payload
    const token = jwt.sign({_id: user._id}, process.env.JWTSECRETE)
    res.cookie("auth", token)
    console.log(token)
    res.status(200).json({data: user, success: true, message: "user registered successfully"})
})

module.exports.loginAUser = asyncErrorHandler(async function(req, res){
    const {email, password} = req.body
    const user = await Users.findOne({email})
    if(!user) return res.status(404).json({data: null, success: false, message: "no user found, create a user"})
    const check = await bcrypt.compare(password, user.password)
    if(!check) return res.status(401).json({data: null, success: true, message: "password is not correct"})

    const token = jwt.sign({_id: user._id}, process.env.JWTSECRETE)
    res.cookie("auth", token)
    console.log(token)
    res.status(200).json({success: true, message: "login successful"})

})

module.exports.updatePassword = asyncErrorHandler(async function(req, res){
    console.log("HIT UPDATE")
    const userPassword = req.body.password
    if(!userPassword) return res.status(400).json({data: null, success: false, message: "only password can be updated"})
    const hashedPassword = await bcrypt.hash(userPassword, 10)
    await Users.updateOne({_id: req.user._id}, {password: hashedPassword}) 
    res.status(200).json({message: "password updated successful", success: true})
    res.send("only password can be updated here and all other logged in devices token should be invalid")
})

module.exports.logout = asyncErrorHandler(async function(req, res){
    res.cookie("auth", "", {maxAge: 1})
    res.status(200).json({message: "logout successful", success: true})
})

