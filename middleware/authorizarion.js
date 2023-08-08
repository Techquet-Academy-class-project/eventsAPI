const { asyncErrorHandler } = require("../errorHandler/asyncerrorhandler")
const jwt = require("jsonwebtoken")
const {User} = require("../database/db")

module.exports.authorizeUser = asyncErrorHandler(async function(req,res,next){
    // check if token exist
    const token = req.cookies.authorization
    if(!token) return res.status(401).json({message : "Authentication failed, please log in", success : true, data : null})
      // check if token is valid
      const decodedeData = jwt.verify(token, process.env.JWTSECRET)
      // fetching back the user contained in the token
      const user = await User.findById(decodedeData._id).populate("events")
      const iat = decodedeData.iat * 1000
      if(iat < new Date(user.lastchangedPassword).getTime()) return res.status(401).json({message: "request failed, enter correct password", success: false})
      // check if user exists
      if(!user) return res.json({data: user, message : "No user found", success : false})
    // if they all checks out call next
        req.user = user
    next()
    // if not we want to respond with an erro
  })