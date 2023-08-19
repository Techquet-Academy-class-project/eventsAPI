const { asyncErrorhandler } = require('../async-errorhandler/async-errorhandler');
const fs = require('fs/promises');
const { v4: uuidv4 } = require('uuid');



//Create an event--auth      DONE
module.exports.creatAnEvent = asyncErrorhandler(async (req, res) => {
    //Read the event database
    const eventjsonDatabase = await fs.readFile(__dirname + '/../database/events.json', 'utf-8')
    const eventDatabase = JSON.parse(eventjsonDatabase);
    //Create an event
    const event = { ...req.body, createdBy: req.authUser._id, _id: uuidv4(), audience: []};
    eventDatabase.push(event);
    // const event = await Event.create({...req.body, createdBy: req.authUser._id});
    if (!event) return res.status(500).json({ message: 'There was an error', success: false });
    //Update the event database
    await fs.writeFile(__dirname + '/../database/events.json', JSON.stringify(eventDatabase));
    //Read the user database
    const jsonDatabase = await fs.readFile(__dirname + '/../database/users.json', 'utf-8');
    const userDatabase = JSON.parse(jsonDatabase);
    const userIndex = userDatabase.findIndex((user) => user._id === req.authUser._id);
    //Update the 'events' field in the user database
    userDatabase[userIndex].events.push(event._id);
    await fs.writeFile(__dirname + '/../database/users.json', JSON.stringify(userDatabase));
    // await User.updateOne({_id: req.authUser._id}, {$push: {events: event}});
    return res.status(201).json({ data: event, messsage: 'Event created successfully!!', success: true });
});

//Get all events--unauth    DONE.
module.exports.getAllEvents = asyncErrorhandler(async (req, res) => {
    //Read the event database
    const eventjsonDatabase = await fs.readFile(__dirname + '/../database/events.json', 'utf-8')
    const eventDatabase = JSON.parse(eventjsonDatabase);  //all the events
    //Read the user database.
    const jsonDatabase = await fs.readFile(__dirname + '/../database/users.json', 'utf-8');
    const userDatabase = JSON.parse(jsonDatabase);
    //Populate each of the events with name and email
    const events = eventDatabase.map((event) => {
        //Populate the createdBy with name and email.
        const foundUser = userDatabase.find((user) => user._id === event.createdBy)
        event.createdBy = { _id: foundUser._id, name: foundUser.name, email: foundUser.email };
        delete event.audience;
        return event;
    })
    // const events = await Event.find({}, {audience: 0}).populate('createdBy', 'name email');
    if (!eventDatabase) return res.status(404).json({ message: 'Not found', success: false });
    return res.status(200).json({ data: events, success: true });
});


//Get all events with available tickets--unauth    DONE
module.exports.getEventsAvailable = asyncErrorhandler(async (req, res) => {
    //Read the event database
    const eventjsonDatabase = await fs.readFile(__dirname + '/../database/events.json', 'utf-8');
    const eventDatabase = JSON.parse(eventjsonDatabase);
    //Get the available events
    const availableEvents = eventDatabase.filter((event) => event.availableTickets > 0);
    //Read the user database.
    const jsonDatabase = await fs.readFile(__dirname + '/../database/users.json', 'utf-8');
    const userDatabase = JSON.parse(jsonDatabase);
    //Populate the createdBy field of each events with name and email.
    const events = availableEvents.map((event) => {
        //Populate the createdBy with name and email.
        const foundUser = userDatabase.find((user) => user._id === event.createdBy)
        event.createdBy = { _id: foundUser._id, name: foundUser.name, email: foundUser.email };
        delete event.audience;
        return event;
    });
    // const events = await Event.find({availableTickets: {$gt: 0}},{audience: 0}).populate('createdBy', 'name email');
    if (!events) return res.status(404).json({ message: 'Not found!!', success: false });
    return res.status(200).json({ data: events, success: true });
});


//Get one event excluding users who purchased tickets--unauth     DONE
module.exports.getAnEvent = asyncErrorhandler(async (req, res) => {
    const eventId = req.params.eventId;
    //Read the events database
    const eventjsonDatabase = await fs.readFile(__dirname + '/../database/events.json', 'utf-8')
    const eventDatabase = JSON.parse(eventjsonDatabase);
    //Find the event
    const foundEvent = eventDatabase.find((event) => event._id === eventId);
    //Remove the audience field.
    delete foundEvent.audience;
    //Read the user database.
    const jsonDatabase = await fs.readFile(__dirname + '/../database/users.json', 'utf-8');
    const userDatabase = JSON.parse(jsonDatabase);
    //Find the details of the user who owns the event.
    const foundUser = userDatabase.find((user) => user._id === foundEvent.createdBy);
    //Populate the createdBy field of the event with name and email
    foundEvent.createdBy = { _id: foundUser._id, name: foundUser.name, email: foundUser.email };
    // const event = await Event.findOne({_id: eventId}, {audience: 0}).populate('createdBy', 'name email');
    if (!foundEvent) return res.status(404).json({ message: 'Not found!', success: false });
    return res.status(200).json({ data: foundEvent, success: true });
});


//Purchase a ticket for an event--auth route      DONE
module.exports.purchaseATicket = asyncErrorhandler(async (req, res) => {

    const eventId = req.params.eventId;
    //Read the event database
    const eventjsonDatabase = await fs.readFile(__dirname + '/../database/events.json', 'utf-8')
    const eventDatabase = JSON.parse(eventjsonDatabase);
    //Find the event
    const foundEvent = eventDatabase.find((event) => event._id === eventId);
    // const event = await Event.findOne({_id: eventId});
    if (!foundEvent) return res.status(404).json({ message: 'Not found!!!', success: false });

    //Check if the event date has expired
    const formattedEventDate = new Date(foundEvent.eventDate).getTime();
    const todaysTimestamp = new Date().getTime()
    if (formattedEventDate < todaysTimestamp) return res.status(403).json({ message: 'Event date has expired! You cannot purchase a ticket!', success: false })

    //Check if there's available ticket
    if (foundEvent.availableTickets === 0) return res.status(403).json({ message: 'Sorry, there are no available tickets for this event.', success: false });

    //An event creator cannot purchase an event
    if (req.authUser._id === foundEvent.createdBy) return res.status(403).json({ message: 'You, the event creator cannot purchase a ticket of your event', success: false });
    console.log('here', foundEvent);
    //Check if the user has already purchased the ticket
    if (foundEvent.audience.includes(req.authUser._id)) return res.status(403).json({ message: 'You have already purchased a ticket.' });


    //Issue a ticket to the user--by adding his id to the 'audience' field.
    const eventIndex = eventDatabase.indexOf(foundEvent);
    eventDatabase[eventIndex].audience.push(req.authUser._id);
    eventDatabase[eventIndex].availableTickets -= 1;
    //Update the event database.
    await fs.writeFile(__dirname + '/../database/events.json', JSON.stringify(eventDatabase));

    //Update the 'tickets' field of the user.
    //Read the user database
    const jsonDatabase = await fs.readFile(__dirname + '/../database/users.json', 'utf-8');
    const userDatabase = JSON.parse(jsonDatabase);
    //Get the user's data index in the database
    const userIndex = userDatabase.findIndex((user) => user._id === req.authUser._id);
    //actual update in tickets array
    userDatabase[userIndex].tickets.push(eventId);
    //Update to the userDatabase.
    await fs.writeFile(__dirname + '/../database/users.json', JSON.stringify(userDatabase));
    // await User.updateOne({_id: req.authUser._id}, {$push: {tickets: eventId}});
    return res.status(200).json({ message: 'You have successfully purchased a ticket!', success: true });
});

//Get all the tickets the loggedin users purchased--auth route           DONE
module.exports.getAllPurchasedTickets = asyncErrorhandler(async (req, res) => {
    //Read the user database.
    const jsonDatabase = await fs.readFile(__dirname + '/../database/users.json', 'utf-8');
    const userDatabase = JSON.parse(jsonDatabase);
    console.log('ticket1');
    //Find the user
    const foundUser = userDatabase.find((user) => user._id === req.authUser._id);
    console.log('ticket2');
    if (!foundUser) return res.status(404).json({ message: 'Not found!', success: false })
    console.log('ticket3');
//Read the event database.
const eventjsonDatabase = await fs.readFile(__dirname + '/../database/events.json', 'utf-8')
const eventDatabase = JSON.parse(eventjsonDatabase);
console.log('ticket4');
//Populate the 'tickets' field with the event title and eventDate.
const allTickets = foundUser.tickets.map((eventId) => {
    console.log('ticket5');
    const event = eventDatabase.find((eachEvent) => eachEvent._id === eventId);
    console.log(event);
    console.log('ticket6');
    return { _id: event._id, title: event.title, eventDate: event.eventDate };
});
console.log('ticket7');
// const allTickets= await User.find({}, 'tickets').populate('tickets', 'title eventDate')
    return res.status(200).json({ allPurchasedTickets: allTickets, success: true })
});

//Get all events the logged in users created--auth route    DONE
module.exports.getAllAuthUserEvents = asyncErrorhandler(async (req, res) => {
    //Read the event database
    const eventjsonDatabase = await fs.readFile(__dirname + '/../database/events.json', 'utf-8');
    const eventDatabase = JSON.parse(eventjsonDatabase);
    //Read the user database
    const jsonDatabase = await fs.readFile(__dirname + '/../database/users.json', 'utf-8');
    const userDatabase = JSON.parse(jsonDatabase);
    //Populate the createdBy field of each event with name and email.
    for (let event of eventDatabase) {
        //Populate createdBy with name and email
        const eventOwner = userDatabase.find((user) => user._id === event.createdBy);
        event.createdBy = { _id: eventOwner._id, name: eventOwner.name, email: eventOwner.email };
        //Populate each event audience with their name and email.
        for (let i = 0; i < event.audience.length; i++) {
            //find the audience who owns the id
            const audienceData = userDatabase.find((user) => user._id === event.audience[i]);
            event.audience[i] = { _id: audienceData._id, name: audienceData.name, email: audienceData.email };
        };
    };
    // const events = await Event.find({}).populate('audience', 'name email').populate('createdBy', 'name email');
    if (!eventDatabase) return res.status(404).json({ message: 'Not found!', success: false });
    return res.status(200).json({ data: eventDatabase, success: true });
});

//Get all my events-auth route    DONE
module.exports.getAllMyEvents = asyncErrorhandler(async (req, res) => {
    // const user = req.authUser;
    //Read the event database
    const eventjsonDatabase = await fs.readFile(__dirname + '/../database/events.json', 'utf-8');
    const eventDatabase = JSON.parse(eventjsonDatabase);
    //Find all the user's events
    const foundEvents = eventDatabase.filter((event) => event.createdBy === req.authUser._id);
    //Read the user database.
    const jsonDatabase = await fs.readFile(__dirname + '/../database/users.json', 'utf-8');
    const userDatabase = JSON.parse(jsonDatabase);
    //Populate both the createdBy and the audience fields of each event with name and email
    for (let event of foundEvents) {
        //Populate createdBy with name and email
        const eventOwner = userDatabase.find((user) => user._id === event.createdBy);
        event.createdBy = { _id: eventOwner._id, name: eventOwner.name, email: eventOwner.email };
        //Populate each event audience with their name and email.
        for (let i = 0; i < event.audience.length; i++) {
            const audienceData = userDatabase.find((user) => user._id === event.audience[i]);
            event.audience[i] = { _id: audienceData._id, name: audienceData.name, email: audienceData.email };
        };
    };
    // const events = await Event.find({createdBy: user._id}).populate('createdBy','name email').populate('audience', 'name email');
    if (!foundEvents) return res.status(404).json({ message: 'Not found!', success: false });
    return res.status(200).json({ data: foundEvents, success: true });
});


//Get all my events' information and all the users that purchased a ticket--auth     DONE
module.exports.getAllMyEventsInfo = asyncErrorhandler(async (req, res) => {
    const eventId = req.params.eventId;
    //Read the event database
    const eventjsonDatabase = await fs.readFile(__dirname + '/../database/events.json', 'utf-8');
    const eventDatabase = JSON.parse(eventjsonDatabase);
    //Find the event whose info you want to check
    const foundEvent = eventDatabase.find((event) => event.createdBy === req.authUser._id && event._id === eventId);
    //Read the user database
    const jsonDatabase = await fs.readFile(__dirname + '/../database/users.json', 'utf-8');
    const userDatabase = JSON.parse(jsonDatabase);
    //Populate createdBy with name and email
    const eventOwner = userDatabase.find((user) => user._id === foundEvent.createdBy);
    foundEvent.createdBy = { _id: eventOwner._id, name: eventOwner.name, email: eventOwner.email };

    //Populate each audience with their name and email.
    for (let i = 0; i < foundEvent.audience.length; i++) {
        const audienceData = userDatabase.find((user) => user._id === foundEvent.audience[i]);
        foundEvent.audience[i] = { _id: audienceData._id, name: audienceData.name, email: audienceData.email };
    };
    // const myEvents = await Event.findOne({_id: eventId, createdBy: req.authUser._id}).populate('audience', 'name email').populate('createdBy', 'name');
    if (!foundEvent) return res.status(404).json({ message: 'Not found!', success: false });

    return res.status(200).json({ data: foundEvent, success: true });
})


//Update logged in users event
module.exports.updateAuthUserEvent = asyncErrorhandler(async (req, res) => {
    const eventId = req.params.eventId;
    const { title, availableTickets, eventDate } = req.body;
    //Read the event database
    const eventjsonDatabase = await fs.readFile(__dirname + '/../database/events.json', 'utf-8');
    const eventDatabase = JSON.parse(eventjsonDatabase);
    //Find the event
    const foundEvent = eventDatabase.find((event) => event._id === eventId);
    // const event = await Event.findOne({_id: eventId});
    if (!foundEvent) return res.status(404).json({ message: 'Not found!!', success: 'false' });
    //Is the user the owner of event
    if (foundEvent.createdBy !== req.authUser._id) return res.status(401).json({ message: 'You are unauthorized to update this event!!', success: false });
    if (req.body.audience) return res.status(401).json({ message: 'You cannot update the audience field', success: false });
    //Get the index of the event Data in the database
    const foundEventIndex = eventDatabase.indexOf(foundEvent);
    //Update the fields according to what was supplied.
    if (title) eventDatabase[foundEventIndex].title = title
    if (availableTickets) eventDatabase[foundEventIndex].availableTickets = availableTickets
    if (eventDate) eventDatabase[foundEventIndex].eventDate = eventDate
    //Update the event database.
    await fs.writeFile(__dirname + '/../database/events.json', JSON.stringify(eventDatabase));
    // await Event.updateOne({_id: eventId}, req.body);
    return res.status(200).json({ message: 'Event updated successfully!!', success: true });
});

//Delete logged in users event
module.exports.DeleteAuthUserEvent = asyncErrorhandler(async (req, res) => {
    const eventId = req.params.eventId;
    //Read the event database
    const eventjsonDatabase = await fs.readFile(__dirname + '/../database/events.json', 'utf-8');
    const eventDatabase = JSON.parse(eventjsonDatabase);
    //Find the event
    const foundEvent = eventDatabase.find((event) => event._id === eventId);
    // const event = await Event.findOne({_id: eventId});
    //is the user the owner of event.
    if (foundEvent.createdBy !== req.authUser._id) return res.status(401).json({ message: 'You are unauthorized to delete this event!!', success: false });
    if (!foundEvent) return res.status(404).json({ message: 'Not found!!', success: 'false' });
    //Delete the event.
    const newEventDatabase = eventDatabase.filter((event) => event._id !== eventId);
    //Update the event database.
    await fs.writeFile(__dirname + '/../database/events.json', JSON.stringify(newEventDatabase));
    // await Event.deleteOne({_id: eventId);
    return res.status(200).json({ message: 'Event deleted successfully!!', success: true });
});



