const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    //The createdBy contains the ID of the user who created the event.
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    title: {type: String, required: [true, 'You must provid {VALUE} in {PATH}']},
    // The available tickets contain the max number of people for the event.
    availableTickets: {type: Number, required: [true, 'You must provid {VALUE} in {PATH}']},
    //The audience is an array that contains the ids of the users who BOUGHT tickets.
    //NOTE: array length should not be longer than availableTickets
    audience: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
    eventDate: {type: Date, required: [true, 'You must provid {VALUE} in {PATH}']}

})

//Event model
module.exports.Event = new mongoose.model('event', eventSchema);



mongoose.connect('mongodb://127.0.0.1:27017/eventsapplication').then(()=>console.log('Events database is connected...')).catch((err)=> console.error('Error connecting to MongoDB: ', err));