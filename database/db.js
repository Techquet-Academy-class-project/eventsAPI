const mongoose = require("mongoose")

const eventSchema = new mongoose.Schema({
    //eventSchema
    createdBy : [{type: mongoose.Schema.ObjectId, ref: "user", required:[true, "all events most be created by a user"]}], 
    title : {type: String, required:[true, "title is required"]},
    availableTickets :{type: Number, required: true},
    audience : [{type: mongoose.Schema.ObjectId, ref: "user"}],
    eventDate : {type: Date, required:true}
})

const userSchema = new mongoose.Schema({
    //userSchema
    name : {type: String, required:[true, "name is required"]},
    email: {type: String, required:[true, "email is required"], unique: true},
    password: {type: String, minLength: 6, required:[true, "password is required"]},
    tickets : [{type: String}],
    events : [{type: mongoose.Schema.ObjectId, ref: "event"}],
    lastchangedPassword: {type: Date, default: new Date()}
})

    //eventSchema
module.exports.Events = mongoose.model("event", eventSchema)
module.exports.Users = mongoose.model("user", userSchema)


mongoose.connect("mongodb://127.0.0.1:27017/eventWebApp")
.then(() => console.log("connected to database"))
.catch((e) =>console.log(e))