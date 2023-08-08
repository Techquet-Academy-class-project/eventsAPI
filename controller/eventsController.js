const express = require("express")
const {Events} = require("../database/db")
// const jwt = require("jsonwebtoken")
// const bcrypt = require("bcryptjs")
const {asyncErrorHandler} = require("../errorHandler/asyncerrorhandler")
// const cookie = require("cookie-parser")
require("dotenv").config()
const router =express.Router()
router.use(express.json())

const createAnEvent = asyncErrorHandler(async function(req, res){
    
    const newEvent = await Events.create({...req.body, createdBy: req.body._id})
    await Events.updateOne({_id: req.body._id}, {$push: {createdBy: newEvent._id}})
    res.status(200).json({data: newEvent, success: true, message: "new event added successfully"})
    // res.send("these are all the events")
})

const getAllEvents = asyncErrorHandler(async function(req, res){
    const event = await Events.find({})
    res.status(200).json({data: event, success: true, message: "these are all the events"})
    // res.send("these are all the events")
})

const getAvailableEvent = asyncErrorHandler(async function(req, res){
    // const eventWithTickets = await Events.find({}).populate("availableTickets")
    const eventWithTickets = await Events.find({availableTickets:availableTickets})
    res.status(200).json({data: eventWithTickets, success: true, message: "these are all the events with available tickets"})
    // res.send("these are all the events with available tickets")
})

const getEventWithAvailableTicket = asyncErrorHandler(async function(req, res){
    const id = req.body
    const eventId = await Events.find({}).populate("availableTickets")
    res.status(200).json({data: eventId, success: true, message: "these are all the event information and the number of available tickets"})
    // res.send("these are all the event information and the number of available tickets")
})

module.exports = {createAnEvent, getAllEvents, getAvailableEvent, getEventWithAvailableTicket}

