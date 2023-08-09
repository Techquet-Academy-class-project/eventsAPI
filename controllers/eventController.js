const { Event } = require('../models/eventModel');
const { User } = require('../models/userModel');
const { asyncErrorhandler } = require('../async-errorhandler/async-errorhandler');

//Create an event--auth
module.exports.creatAnEvent = asyncErrorhandler(async(req, res) =>{
    //Create an event
    const event = await Event.create({...req.body, createdBy: req.authUser._id});
    if(!event) return res.status(500).json({message: 'There was an error', success: false});
    //Update the 'events' field in the user database
    await User.updateOne({_id: req.authUser._id}, {$push: {events: event}});
    return res.status(201).json({data: event, messsage: 'Event created successfully!!', success: true});
});

//Get all events--unauth
module.exports.getAllEvents = asyncErrorhandler(async (req, res) =>{
    const events = await Event.find({}, {audience: 0}).populate('createdBy', 'name email');
    if(!events) return res.status(404).json({message: 'Not found', success: false});
    return res.status(200).json({data: events, success: true});
});


//Get all events with available tickets--unauth
module.exports.getEventsAvailable = asyncErrorhandler(async (req, res)=>{
    const events = await Event.find({availableTickets: {$gt: 0}},{audience: 0}).populate('createdBy', 'name email');
    if(!events) return res.status(404).json({message: 'Not found!!', success: false});
    return res.status(200).json({data: events, success: true});
});


//Get one event excluding users who purchased tickets--unauth
module.exports.getAnEvent = asyncErrorhandler(async (req, res)=>{
    const eventId = req.params.eventId;
    const event = await Event.findOne({_id: eventId}, {audience: 0}).populate('createdBy', 'name email');
    if(!event) return res.status(404).json({message: 'Not found!', success: false});
    return res.status(200).json({data: event, success: true});
});

//Purchase a ticket for an event--auth route
module.exports.purchaseATicket = asyncErrorhandler(async (req, res) =>{
    const eventId = req.params.eventId;
    //Find the event
    const event = await Event.findOne({_id: eventId});
    if(!event) return res.status(404).json({message: 'Not found!!!', success: false});

    //Check if the event date has expired
    const formattedEventDate = new Date(event.eventDate).getTime();
    
    const todaysTimestamp  = new Date().getTime()
    //Check if the event date has expired
    if(formattedEventDate < todaysTimestamp) return res.status(403).json({message: 'Event date has expired! You cannot purchase a ticket!', success: false})

    //Check if there's available ticket
    if(event.availableTickets === 0) return res.status(403).json({message: 'Sorry, there are no available tickets for this event.', success: false});
    
    //An event creator cannot purchase an event
    if(req.authUser._id.toString() === event.createdBy.toString()) return res.status(403).json({message: 'You, the event creator cannot purchase a ticket of your event', success: false});

    console.log(event.createdBy, req.authUser._id);
    
    //Check if the user has already purchased the ticket
    if(event.audience.includes(req.authUser._id)) return res.status(403).json({message: 'You have already purchased a ticket.'});


    //Issue a ticket to the user--by adding his id to the 'audience' field.
    event.audience.push(req.authUser._id);
    event.availableTickets -= 1;
    event.save();

    //Update the 'tickets' field of the user
    await User.updateOne({_id: req.authUser._id}, {$push: {tickets: eventId}});

    
    return res.status(200).json({message: 'You have successfully purchased a ticket!', success: true});
});


//Get all the tickets the loggedin users purchased--auth route
module.exports.getAllPurchasedTickets = asyncErrorhandler(async (req, res) =>{
    //Personal Note: I could use either a string for the projections or an object e.g. 'audience events' or {audience: 1, events: 1}
    const allTickets= await User.find({_id: req.authUser._id}, 'tickets').populate('tickets', 'title eventDate')
    if(!allTickets) return res.status(404).json({message: 'Not found!', success: false})
    return res.status(200).json({allPurchasedTickets: allTickets, success: true})
});

//Get all events the logged in users created--auth route
module.exports.getAllAuthUserEvents = asyncErrorhandler(async (req, res) =>{
    const events = await Event.find({}).populate('audience', 'name email').populate('createdBy', 'name email');
    if(!events) return res.status(404).json({message: 'Not found!', success: false});
    return res.status(200).json({data: events, success: true});
});

//Get all my events-auth route
module.exports.getAllMyEvents = asyncErrorhandler(async (req, res)=>{
    const user = req.authUser;
    const events = await Event.find({createdBy: user._id}).populate('createdBy','name email').populate('audience', 'name email');
    if(!events) return res.status(404).json({message: 'Not found!', success: false});
    return res.status(200).json({data: events, success: true});
});


//Get all my events' information and all the users that purchased a ticket--auth
module.exports.getAllMyEventsInfo = asyncErrorhandler(async (req, res) =>{
    const eventId = req.params.eventId;
    const myEvents = await Event.findOne({_id: eventId, createdBy: req.authUser._id}).populate('audience', 'name email').populate('createdBy', 'name');
    if(!myEvents) return res.status(404).json({message: 'Not found!', success: false});

    return res.status(200).json({data: myEvents, success: true});
})


//Update logged in users event
module.exports.updateAuthUserEvent = asyncErrorhandler(async (req, res) =>{
    const eventId = req.params.eventId;
    const event = await Event.findOne({_id: eventId});
    //is the user the owner of event
    if(event.createdBy.toString() !== req.authUser._id.toString()) return res.status(401).json({message: 'You are unauthorized to update this event!!', success: false});
    if(!event) return res.status(404).json({message: 'Not found!!', success: 'false'});
    if(req.body.audience) return res.status(401).json({message: 'You cannot update the audience field', success: false});
    await Event.updateOne({_id: eventId}, req.body);
    return res.status(200).json({message: 'Event updated successfully!!', success: true});
})

//Delete logged in users event
module.exports.DeleteAuthUserEvent = asyncErrorhandler(async (req, res) =>{
    const eventId = req.params.eventId;
    const event = await Event.findOne({_id: eventId});

    //is the user the owner of event
    if(event.createdBy.toString() !== req.authUser._id.toString()) return res.status(401).json({message: 'You are unauthorized to delete this event!!', success: false});
    if(!event) return res.status(404).json({message: 'Not found!!', success: 'false'});
    //Delete the event.
    await Event.deleteOne({_id: eventId}, req.body);
    return res.status(200).json({message: 'Event deleted successfully!!', success: true});
})



