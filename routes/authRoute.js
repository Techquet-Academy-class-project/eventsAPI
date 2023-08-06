const express = require('express');
const {authorizeUser} = require('../middlewares/authorization-middleware');
const {signup, login, logout, changePassword} = require('../controllers/authController');
const router = express.Router();

router.use(express.json());

//Signup
router.post('/signup', signup);

//login
router.post('/login', login);

//change password
router.post('/changepassword', authorizeUser,changePassword);

//logout
router.get('/logout', logout);

module.exports = router;