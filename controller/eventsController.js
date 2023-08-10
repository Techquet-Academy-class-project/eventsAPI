const express = require("express")
const {Events} = require("../database/db")
const {asyncErrorHandler} = require("../errorHandler/asyncerrorhandler")
const router =express.Router()
router.use(express.json())

module.exports.createAnEvent = asyncErrorHandler(async function(req, res){
    //create a user
    const newEvent = await Events.create({...req.body, createdBy: req.user._id})
    await Events.updateOne({_id: req.body._id}, {$push: {createdBy: newEvent._id}})
    res.status(200).json({data: newEvent, success: true, message: "new event added successfully"})
})

module.exports.getAllEvents = asyncErrorHandler(async function(req, res){
    //get all available events
    const event = await Events.find({}, {title: 1, availableTickets: 1, createdBy: 1})
    res.status(200).json({data: event, success: true, message: "these are all the events"})
})

module.exports.getAvailableEvent = asyncErrorHandler(async function(req, res){
    // const eventWithTickets = await Events.find({}).populate("availableTickets")
    const eventWithTickets = await Events.findById({_id: req.params._id}, "-audience")
    res.status(200).json({data: eventWithTickets, success: true, message: "these are all the events with available tickets"})
})

module.exports.getEventWithAvailableTicket = asyncErrorHandler(async function(req, res){
    const id = req.body
    const eventId = await Events.find({}).populate("availableTickets")
    res.status(200).json({data: eventId, success: true, message: "these are all the event information and the number of available tickets"})
})


