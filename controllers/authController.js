const {User} = require('../models/userModel')
const {Event} = require('../models/eventModel')
const {asyncErrorhandler} = require('../async-errorhandler/async-errorhandler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();


//Create a user--signup
module.exports.signup = asyncErrorhandler(async (req, res)=>{
    const { password, ...others } = req.body;
    //Check for password length
    if(password.length<6) return res.json({message: 'password length must be greater than 5!', success: false})
    // const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ ...others, password: hashedPassword });
    const payload = { _id: user._id };
    const secretKey = process.env.USER_SECRET_KEY;
    //Generate a signature or token ***.***.***
    const token = jwt.sign(payload, secretKey);
    //Store the token in the cookie
    res.cookie('authorization', token);
    return res.status(201).json({ data: user, yourToken: token, message: 'User successfully created!!!' });
});

//Login
module.exports.login = asyncErrorhandler(async (req, res) => {
    const { email, password } = req.body;
    if(password.length<6) return res.status(500).json({sucess: false, message: 'password length must be greater than 5!'});
    //Find the user
    const user = await User.findOne({ email });
    //Unauthenticated-invalid username
    if (!user) return res.status(404).json({ data: null, message: "Authentication failed", success: false });
    //Authenticated-username and password check.
    const check = await bcrypt.compare(password, user.password);
    //Invalid password
    if (!check) return res.status(401).json({ message: 'Authentication failed', success: false, data: null });
    const payload = { _id: user._id };
    const secretKey = process.env.USER_SECRET_KEY
    //Generate a signature or token ***.***.***
    const token = jwt.sign(payload, secretKey);
    //Store the token in the cookie
    res.cookie('authorization', token);
    // const {password:authPassword, ...others} = user;
    return res.status(200).json({ data: user, yourToken: token, success: true, message: 'Login was successful!'});
    
});


//Logout
module.exports.logout = asyncErrorhandler(async (req, res)=>{
    res.cookie('authorization', '', {maxAge: 1});
    return res.status(200).json({message: 'Logout successful!!!', success: true})
});

//Change Password
module.exports.changePassword = asyncErrorhandler(async (req, res)=>{
    if(req.body.password.length<6) return res.status(401).json({message: 'Password must be greater than 6', success: false});
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await User.updateOne({_id: req.authUser._id}, {password: hashedPassword, lastChangedPassword: Date.now()})
    // const check = await bcrypt.compare(password, user.password);
    return res.status(200).json({message:'Password successfully updated!!!', success: true})
});