const express = require("express")
const {Users, Events} = require("../database/db")
const {asyncErrorHandler} = require("../errorHandler/asyncerrorhandler")
const router = express.Router
router.use(express.json())

const buyTicket = asyncErrorHandler(async function(req, res){
    //Buy a ticket of an event
    const myEvent = await Events.findOne({_id: req.params._id}) 
    if(!myEvent) return res.status(400).json({data: null, message: "no event found"})
    const purchasedTicket = await myEvent.createdBy.equals(req.user._id)
    if(purchasedTicket) return res.status(400).json({message: "you can only purchase a ticket for an event you did not create", success: false})
    //check the number of tickets available
    if(myEvent.availableTickets == 0) return res.status(400).json({message: "no tickets available"})
    //update the db by updating audience and the availableTickets
    // let {audience} = myEvent
    myEvent.audience.push(req.user._id)
    myEvent.availableTickets--;
    await myEvent.save();

    //update users ticket array
    await Users.updateOne({email: req.user.email}, {$push: {tickets: myEvent._id}})
    res.status(200).json({message: "you have bought a ticket for this event", success: true, availableTickets: myEvent.availableTickets})
    // res.send("Buy a ticket of an event")
})

const usersTickets = asyncErrorHandler(async function(req, res){
    //get all events the logged in users created, if not send a status of 404(not found)
    const findUser = await Users.find().lean()
    if(!findUser) return res.status(404).json({data: null, success: false, message: "No user found"})
    //copy all the data from already found user using map, access the name property and tickets
    const foundUser = await findUser.map((user) =>({
        name: user.name,
        tickets: user.tickets
    }))
    res.status(200).json({data: foundUser, success: true, message: "here is the users an their tickets"})
    // res.send("all tickets the logged in users purchased")
})

const getAllEventsCreatedByAUser = asyncErrorHandler( async function(req, res){
    //all events the logged in users created
    const findUser = await Users.find().populate("events")
    if(!findUser) return res.status(404).json({data: null, success: true, message: "users and events not found"})
    //copy all the data from already found user using map, access the name property and events property
    const foundUser = await findUser.map((user) =>({
        name: user.name,
        events: user.events
    }))
    res.status(200).json({data: null, success: true, message: "here is the users and their events"})
    // res.send("all events the logged in users created")
})

const getAllMyEvents = asyncErrorHandler(async function(req, res){
    //get all the events of the logged in user
    const userEvent = await Users.findById({_id: req.body._id}).populate("events")
    if(!userEvent) return res.status(404).json({data: null, message: "user and event not found"})
    res.status(200).json({message: "here is the user and his event", success: true, data: userEvent})
    // res.send("all my events")
})

const getAllPurchasedTickets = asyncErrorHandler(async function(req, res){
    //all my event information and all the users that purchased a ticket
    const myEvent = Events.findOne({_id: req.params._id, createdBy: req.user._id}).populate("audience")
    if(!myEvent) return res.status(404).json({message: "no events found", success: false})
    res.status(200).json({data: myEvent, success: true})

    res.send("all my events information and all the users that purchased a ticket")
})

const getMyProfile = asyncErrorHandler( async function(req, res){
    const userProfile = await Users.findById({_id: req.body._id}, "-password")
    if(!userProfile) return res.status(404).json({data: null, success: true, message: "can not get user profile"})
    res.status(200).json({success: true, message: "here is the user profile", data: userProfile})
    // res.send("every inforamtion about me except the password")
})

const updateMyProfile = asyncErrorHandler(async function(req, res){
    //only email and name can be updated
    const findUser = await Users.findById({_id: req.user._id}).lean()
    const foundUser = await findUser.map((user) =>({
        email: user.email,
        name: user.name
    }))
    if(!foundUser) return res.status(404).json({data: null, success: false, message: "only email and name can be updated"})
    const result = await Users.updateOne(foundUser)
    res.status(200).json({success: true, message: "user update successful", data: result})
    // res.send("only email and name can be updated")
})

const updateMyEvent = asyncErrorHandler(async function(req, res){
    const getEvent = Events.findOne({_id: req.params._id, createdBy: req.user._id})
    if(!getEvent) return res.status(400).json({message: "you are unauthorized for this update", success:false})
    await Events.updateOne({_id: req.params._id}, req.body)
    res.status(200).json({message: "update successful", success: true})
    // res.send("update the logged in users event")
})

module.exports = {
    updateMyEvent, 
    updateMyProfile, 
    getMyProfile, 
    getAllPurchasedTickets, 
    getAllMyEvents, 
    getAllEventsCreatedByAUser,
    usersTickets,
    buyTicket
}





