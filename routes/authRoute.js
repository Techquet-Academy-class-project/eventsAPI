const express = require("express")
// const {Users, Events} = require("../database/db")
// const {authorization} = require("../middleware/authorizarion")
const { 
    buyTicket, 
    usersTickets, 
    getAllEventsCreatedByAUser, 
    getAllMyEvents, 
    getAllPurchasedTickets, 
    getMyProfile, 
    updateMyProfile, 
    updateMyEvent 
} = require("../controller/authController")
const { authorizeUser } = require("../middleware/authorizarion")
// const { count } = require("console")

const router = express.Router()
router.use(express.json())


// * `GET purchase/eventId` Buy a ticket of an event
// * `GET /users/tickets` all tickets the logged in users purchased
// * `GET /users/events` all events the logged in users created
// * `GET /myevents` all my events
// * `GET /myevents/:id` all my event information and all the users that purchased a ticket
// * `PUT /update/eventId` update the logged in users event 
// * `GET /myprofile` every inforamtion about me except the password
// * `PUT /update/Myprofile` [only email and name can be updated]
// * `PUT /update/security` [only password can be updated here] and all other logged in devices token should be invalid

router.get("/purchase/:_id", authorizeUser, buyTicket)

router.get("/users/tickets", authorizeUser, usersTickets)

router.get("/users/events", authorizeUser, getAllEventsCreatedByAUser)

router.get("/myevents", authorizeUser, getAllMyEvents)

router.get("/myevents/:_id", authorizeUser, getAllPurchasedTickets)

router.get("/myprofile", authorizeUser, getMyProfile)

router.put("/update/myprofile", authorizeUser, updateMyProfile)

router.put("/update/:id", authorizeUser, updateMyEvent)


module.exports = router