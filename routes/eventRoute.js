const express = require("express")
const { 
    createAnEvent, 
    getAllEvents, 
    getEventWithAvailableTicket, 
    getAvailableEvent 
} = require("../controller/eventsController")

const router = express.Router()

router.use(express.json())


// * `GET /events` return all events
// * `GET /events/available` return all events with available tickets
// * `GET /events/id` return the event information and the number of available tickets [Note do not return the users who purchased the tickets]

router.post("/events", createAnEvent)

router.get("/events", getAllEvents)

router.get("/events/available", getEventWithAvailableTicket)

router.get("/events/:_id", getAvailableEvent)

module.exports = router

