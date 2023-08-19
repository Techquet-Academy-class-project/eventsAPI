const express = require('express');
const {authorizeUser} = require('../middlewares/authorization-middleware');
const {getAUser, getMyProfile} = require('../controllers/userController');
const {getAllPurchasedTickets, getAllAuthUserEvents} =  require('../controllers/eventController')
const router = express.Router();


router.use(express.json());

//get all events--auth--events
router.get('/events', authorizeUser, getAllAuthUserEvents);

//get all purchased ticket--auth---users
router.get('/tickets', authorizeUser, getAllPurchasedTickets);


//Get my profile
router.get('/profile', authorizeUser, getMyProfile);

//Get a user
router.get('/:userId', getAUser);

module.exports = router;