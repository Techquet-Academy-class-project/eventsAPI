const { asyncErrorHandler } = require("../errorHandler/asyncerrorhandler")
const jwt = require("jsonwebtoken")
const {Users} = require("../database/db")
require("dotenv").config()
module.exports.authorizeUser = asyncErrorHandler(async function(req,res,next){
    console.log("hit middleware")  
  // check if token exist
    console.log(req.cookies)

    const token = req.cookies.auth
    console.log(token)
    if(!token) return res.status(401).json({message : "Authentication failed, please log in", success : true, data : null})
    console.log("Nick said i should put it here")  
    // check if token is valid
      const decodedData = jwt.verify(token, process.env.JWTSECRETE)
      console.log("after decode")
      // fetching back the user contained in the token
      const user = await Users.findById(decodedData._id).populate("events")
      const iat = decodedData.iat * 1000
      if(iat < new Date(user.lastchangedPassword).getTime()) return res.status(401).json({message: "request failed, enter correct password", success: false})
      console.log("comparism")
      // check if user exists
      if(!user) return res.json({data: user, message : "No user found", success : false})
    // if they all checks out call next
        req.user = user
      console.log("this is the end of middleware")
    next()
    // if not we want to respond with an erro
  })