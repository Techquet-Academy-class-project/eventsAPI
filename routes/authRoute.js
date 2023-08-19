const express = require('express');
const {signup, login, logout} = require('../controllers/authController');
const router = express.Router();

router.use(express.json());

//Signup
router.post('/signup', signup);

//login
router.post('/login', login);

//logout
router.get('/logout', logout);

module.exports = router;