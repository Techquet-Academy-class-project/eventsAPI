const express = require("express")
// const {Users} = require("../database/db")
// const {getAUserWithEvent, createAUser, loginAUser, logout, updatePassword} = require("../controller/usersController")
// const authorization = require("../middleware/authorizarion")
const { 
    getAUserWithEvent, 
    createAUser, 
    loginAUser, 
    updatePassword, 
    logout 
} = require("../controller/usersController")
const { authorizeUser } = require("../middleware/authorizarion")
const router = express.Router()


router.use(express.json())


// * `GET /users/id` return a user and all his events [Not including the users who both his tickets]
// * `POST /login`
// * `POST /signup



router.post("/register", createAUser)

router.post("/login", authorizeUser, loginAUser)

router.put ("/update/security", authorizeUser, updatePassword)

router.post("/logout", logout)
router.get("/users/:_id", getAUserWithEvent)



module.exports = router
