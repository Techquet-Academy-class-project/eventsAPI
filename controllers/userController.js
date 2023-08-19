const { asyncErrorhandler } = require('../async-errorhandler/async-errorhandler');
const fs = require('fs/promises');

//get a user and all his events--unauth       DONE
module.exports.getAUser = asyncErrorhandler(async (req, res) => {
    const userId = req.params.userId;
    //Read the user database
    const jsonDatabase = await fs.readFile(__dirname + '/../database/users.json', 'utf-8');
    const userDatabase = JSON.parse(jsonDatabase);
    //Find the user in the user database
    const user = userDatabase.find((user)=> user._id === userId);
    delete user.password;
    delete user.tickets;
    //Find the 
    const eventjsonDatabase = await fs.readFile(__dirname + '/../database/events.json', 'utf-8')
    const eventDatabase = JSON.parse(eventjsonDatabase);
    //Populate the events field
    for(let i=0; i< user.events.length; i++){
        const foundEvent = eventDatabase.find((event)=> event._id === user.events[i]);
        user.events[i] = {_id: foundEvent._id, title: foundEvent.title, availableTickets: foundEvent.availableTickets, eventDate: foundEvent.eventDate};
    };
    // const user = await User.findOne({_id: userId}, {password: 0, tickets: 0}).populate('events', '-audience');
    if (!user) return res.status(404).json({ message: 'No user found', success: false });
    return res.status(201).json({ data: user, success: true });
});

//Get my profile--auth     DONE
module.exports.getMyProfile = asyncErrorhandler(async (req, res) => {
    //Read the user database
    const jsonDatabase = await fs.readFile(__dirname + '/../database/users.json', 'utf-8');
    const userDatabase = JSON.parse(jsonDatabase);
    //Find the profile
    const user = userDatabase.find((user)=> user._id === req.authUser._id);
    delete user.password;
    //Read the event database
    const eventjsonDatabase = await fs.readFile(__dirname + '/../database/events.json', 'utf-8')
    const eventDatabase = JSON.parse(eventjsonDatabase);
    //Populate the events field
    for(let i=0; i< user.events.length; i++){
        const foundEvent = eventDatabase.find((event)=> event._id === user.events[i]);
        user.events[i] = {_id: foundEvent._id, title: foundEvent.title, availableTickets: foundEvent.availableTickets, audience: foundEvent.audience, eventDate: foundEvent.eventDate};
    };
    //Populate the tickets field
    for(let i=0; i< user.tickets.length; i++){
        const foundEvent = eventDatabase.find((event)=> event._id === user.tickets[i]);
        user.tickets[i] = {_id: foundEvent._id, title: foundEvent.title, eventDate: foundEvent.eventDate};
    };
    // const user = await User.findOne({ _id: req.authUser._id }).populate('events').populate('tickets');
    if (!user) return res.status(404).json({ message: 'Not found!', success: false });
    return res.status(200).json({ data: user, message: 'Your request was successful', success: true })

});

//Update my profile--auth   DONE
module.exports.updateMyProfile = asyncErrorhandler(async (req, res) => {
    const {name, email, password, tickets, events} = req.body;
    //You can only update name and email
    const user = await req.authUser;
    //Check if the user exists
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (password || tickets || events) return res.status(401).json({ message: 'You can only update your name and email!!!', success: false});
    //Update user profile.
        //Read the user database
    const jsonDatabase = await fs.readFile(__dirname + '/../database/users.json', 'utf-8');
    const userDatabase = JSON.parse(jsonDatabase);
    const uniqueEmail = userDatabase.find((eachUser) => eachUser.email === email)
    //Check for duplicate name
    if (uniqueEmail) return res.status(400).json({ message: 'This email already exists, try another one', success: false });
    const userIndex = userDatabase.findIndex((eachuser) => eachuser._id === user._id);
        //Update the name field
    if(name) userDatabase[userIndex].name = name;
        //Update the email field
    if(email) userDatabase[userIndex].email = email;
        //Actual update.
    await fs.writeFile(__dirname + '/../database/users.json', JSON.stringify(userDatabase));
    // await User.updateOne({ _id: user._id }, req.body);
    return res.status(200).json({ message: 'profile updated successfully!', success: true })
});






