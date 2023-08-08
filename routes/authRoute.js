const express = require("express")
const {Users, Events} = require("../database/db")
const authorization = require("../middleware/authorizarion")
// const { count } = require("console")
const {
    updateMyEvent, 
    updateMyProfile, 
    getMyProfile, 
    getAllPurchasedTickets, 
    getAllMyEvents, 
    getAllEventsCreatedByAUser,
    usersTickets,
    buyTicket
} = require("../controller/authController")
const router = express.Router()



// * `GET purchase/eventId` Buy a ticket of an event
// * `GET /users/tickets` all tickets the logged in users purchased
// * `GET /users/events` all events the logged in users created
// * `GET /myevents` all my events
// * `GET /myevents/:id` all my event information and all the users that purchased a ticket
// * `PUT /update/eventId` update the logged in users event 
// * `GET /myprofile` every inforamtion about me except the password
// * `PUT /update/Myprofile` [only email and name can be updated]
// * `PUT /update/security` [only password can be updated here] and all other logged in devices token should be invalid

router.get("/purchase/:_id", authorization, buyTicket)

router.get("/users/tickets", authorization, usersTickets)

router.get("/users/events", authorization, getAllEventsCreatedByAUser)

router.get("/myevents", authorization, getAllMyEvents)

router.get("/myevents/:_id", authorization, getAllPurchasedTickets)

router.get("/myprofile", authorization, getMyProfile)

router.put("/update/myprofile", authorization, updateMyProfile)

router.put("/update/:id", authorization, updateMyEvent)

module.exports = router