const express = require('express');
const {authorizeUser} = require('../middlewares/authorization-middleware');
const {updateAuthUserEvent} = require('../controllers/eventController');
const {changePassword} = require('../controllers/authController');
const {updateMyProfile} = require('../controllers/userController');
const router = express.Router();

router.use(express.json());


//Update my profile
router.put('/myprofile', authorizeUser, updateMyProfile);

//change password
router.put('/security', authorizeUser, changePassword);

//update authenticated user event--auth--update
router.put('/:eventId', authorizeUser, updateAuthUserEvent);

module.exports = router;