const {User} = require('../models/userModel');
const {asyncErrorhandler} = require('../async-errorhandler/async-errorhandler');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports.authorizeUser = asyncErrorhandler(async (req, res, next) =>{
    //retrieve token from the request object
    const token = req.cookies.authorization;
    //checks if the request contains a valid jwt token or signature
    if(!token) return res.status(401).json({message: 'Authentication failed, please login again.', success: false});
    //If authenticated
    const secretKey = process.env.USER_SECRET_KEY
    // console.log(secretKey);
    const decoded = jwt.verify(token, secretKey);

    const user = await User.findById(decoded._id).populate('events')

    const lastTokenDate = decoded.iat * 1000;
    const passwordUpdatedTime = new Date(user.lastChangedPassword).getTime();
    
    if(lastTokenDate < passwordUpdatedTime ) return res.status(401).json({message: 'Your cookie session has expired, please login again', success: false})

    //store authenticated user id in the request object.
    req.authUser = user;
    return next();
})