const express = require("express")
const {Users} = require("../database/db")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const {asyncErrorHandler} = require("../errorHandler/asyncerrorhandler")
const cookies = require("cookie-parser")
const { useId } = require("react")
require("dotenv").config()


const router = express.Router()

const getAUserWithEvent =  asyncErrorHandler(async function(req, res){
    //finding a user with all his events, excluding the users who both the tickets
    const userId = await Users.findById({_id: req.params._id}, "-tickets").populate("events")
    if(!useId) return res.status(404).json({data: null, success: true, message: "user not found"})
    res.status(200).json({data: userId, success: true, message: "this is a user and all his events"})
    // res.send("this is a user and all his events")
})

const createAUser = asyncErrorHandler(async function(req, res){
    const {password, ...others} = req.body
    const hashedpassword = await bcrypt.hash(password, 10)
    const user = await {password:hashedpassword, ...others}
    const newUser = await Users.create(user)

    const token = jwt.sign("authorization", process.env.JWTSECRETE)
    res.cookie("authorization", token)
    res.status(200).json({data: newUser, success: true, message: "user registered successfully"})
    // res.send("signup successfull")
})

const loginAUser = asyncErrorHandler(async function(req, res){
    const {email, password} = req.body
    const user = await Users.findOne({email})
    if(!user) return res.status(404).json({data: null, success: false, message: "no user found, create a user"})
    const check = await bcrypt.compare({password : user.password})
    if(!check) return res.status(401).json({data: null, success: true, message: "password is not correct"})

    const token = jwt.sign("authorization", process.env.JWTSECRETE)
    res.cookie("authorization", token)
    res.status(200).json({success: true, message: "login successful"})

    // res.send("login successfull")
})

const updatePassword = asyncErrorHandler(async function(req, res){
    const userPassword = req.body.password
    if(!userPassword) return res.status(400).json({data: null, success: false,message: "only password can be updated"})
    const hashedPassword = bcrypt.hash(userPassword, 10)
    await Users.updateOne({_id: req.body._id}, {password: hashedPassword}) 
    res.status(200).json({message: "password updated successful", success: true})
    res.send("only password can be updated here and all other logged in devices token should be invalid")
})

const logout = asyncErrorHandler(async function(req, res){
    res.cookie("authorization", "", {maxAge: 1})
    res.status(200).json({message: "logout successful", success: true})
})

module.exports = {getAUserWithEvent, createAUser, loginAUser, logout, updatePassword}
