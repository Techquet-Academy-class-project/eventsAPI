const mongoose = require('mongoose');

//User  Schema
const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: [true, 'Email must be provided!'], unique: true},
    password: {type: String, required: [true, 'Password must be provided']},
    // Tickets is an array of all the tickets purchased--This should be the eventIds of all the events the user purchased tickets for.
    tickets: [{type: String}],
    //This is an array of ids of all events the user created.
    events: {type:[mongoose.Schema.Types.ObjectId], ref: 'event'},
    lastChangedPassword: {type: Date, Default: Date.now()}
});

//User model
module.exports.User = new mongoose.model('user', userSchema)


mongoose.connect('mongodb://127.0.0.1:27017/eventsapplication').then(()=> console.log('User Database is connected ...')).catch((err)=> console.error('Error connecting to MongoDB: ', err));