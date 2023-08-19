const express = require('express');
const {authorizeUser} = require('../middlewares/authorization-middleware');
const{creatAnEvent, getAllEvents, getEventsAvailable, getAnEvent, purchaseATicket, getAllMyEvents,getAllMyEventsInfo, DeleteAuthUserEvent} = require('../controllers/eventController');

const router = express.Router();


router.use(express.json());

//Create an event--auth--events
router.post('/', authorizeUser, creatAnEvent);

//get all events--unauth--events
router.get('/', getAllEvents);

//get events available--unauth--events
router.get('/available', getEventsAvailable);

//purchase a ticket--auth--events
router.get('/purchase/:eventId', authorizeUser, purchaseATicket);

//get all my events--auth--myevents
router.get('/myevents', authorizeUser, getAllMyEvents);

//get all my events information--auth--myevents
router.get('/myevents/:eventId', authorizeUser, getAllMyEventsInfo);

//get an event excluding the users who purchased the tickets--unauth----events
router.get('/:eventId', getAnEvent);

//Delete an event
router.delete('/delete/:eventId', authorizeUser, DeleteAuthUserEvent)

module.exports = router;