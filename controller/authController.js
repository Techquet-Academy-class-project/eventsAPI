const express = require("express")
const {Users}  = require("../database/db")
const {Events} = require("../database/db")
const {asyncErrorHandler} = require("../errorHandler/asyncerrorhandler")
const router = express.Router()
router.use(express.json())

module.exports.buyTicket = asyncErrorHandler(async function(req, res){
    //Buy a ticket of an event
    const myEvent = await Events.findOne({_id: req.params._id}) 
    console.log(myEvent)
    if(!myEvent) return res.status(404).json({data: null, message: "no event found"})
    // const purchasedTicket = await myEvent.createdBy.equals(req.user._id)
    if(myEvent.createdBy === req.user._id) return res.status(400).json({message: "you can only purchase a ticket for an event you did not create", success: false})
    //check the number of tickets available
    if(myEvent.availableTickets == 0) return res.status(400).json({message: "no tickets available"})
    //update the db by updating audience and the availableTickets
    let {audience} = myEvent
    console.log(myEvent)
    audience.push(req.user._id)
    myEvent.availableTickets--;
    await myEvent.save();

    //update users ticket array
    await Users.updateOne({email: req.user.email}, {$push: {tickets: myEvent._id}})
    res.status(200).json({message: "you have bought a ticket for this event", success: true, availableTickets: myEvent.availableTickets})
    
})

module.exports.usersTickets = asyncErrorHandler(async function(req, res){
    //get all events the logged in users created, if not send a status of 404(not found)
    const findUser = await Users.find().lean()
    if(!findUser) return res.status(404).json({data: null, success: false, message: "No user found"})
    //copy all the data from already found user using map, access the name property and tickets
    const foundUser = await findUser.map((user) =>({
        name: user.name,
        tickets: user.tickets
    }))
    res.status(200).json({data: foundUser, success: true, message: "here is the users an their tickets"})
})

module.exports.getAllEventsCreatedByAUser = asyncErrorHandler( async function(req, res){
    //all events the logged in users created
    const findUser = await Users.find().populate("events")
    if(!findUser) return res.status(404).json({data: null, success: true, message: "users and events not found"})
    //copy all the data from already found user using map, access the name property and events property
    const foundUser = await findUser.map((user) =>({
        name: user.name,
        events: user.events
    }))
    res.status(200).json({data: foundUser, success: true, message: "here is the users and their events"})
})

module.exports.getAllMyEvents = asyncErrorHandler(async function(req, res){
    //get all the events of the logged in user
    const userEvent = await Users.findById({_id: req.user._id}).populate("events")
    if(!userEvent) return res.status(404).json({data: null, message: "user and event not found"})
    res.status(200).json({message: "here is the user and his event", success: true, data: userEvent})
})

module.exports.getAllPurchasedTickets = asyncErrorHandler(async function(req, res){
    //all my event information and all the users that purchased a ticket
    const myEvent = await Events.findOne({_id: req.user._id, createdBy: req.user._id}).populate("audience")
    if(!myEvent) return res.status(404).json({message: "no events found", success: false})
    res.status(200).json({data: myEvent, success: true})

})

module.exports.getMyProfile = asyncErrorHandler( async function(req, res){
    console.log("hit profile")
    console.log(req.user._id)
    const userProfile = await Users.findById({_id: req.user._id})
    if(!userProfile) return res.status(404).json({data: null, success: true, message: "can not get user profile"})
    res.status(200).json({success: true, message: "here is the user profile", data: userProfile})
})
module.exports.updateMyProfile = asyncErrorHandler(async function(req, res){
    //only email and name can be updated
    //find the user by its id
    const findUser = await Users.findById({_id: req.user._id}).lean()
    // extract user name and email for update
    const foundUser = await findUser.map((user) =>({
        email: user.email,
        name: user.name
    }))
    //if no user found, throw an erro
    if(!foundUser) return res.status(404).json({data: null, success: false, message: "only email and name can be updated"})
    //return the name and email of the found user
    const result = await Users.updateOne(foundUser)
    res.status(200).json({success: true, message: "user update successful", data: result})
})

module.exports.updateMyEvent = asyncErrorHandler(async function(req, res){
    // update events
    //find the events by it's id
    const getEvent = Events.findOne({_id: req.params._id, createdBy: req.user._id})
    //throw error if the event is unavailable
    if(!getEvent) return res.status(400).json({message: "you are unauthorized for this update", success:false})
    //update the found event
    await Events.updateOne({_id: req.params._id}, req.body)
    res.status(200).json({message: "update successful", success: true})
})







