const express = require("express");
const {Users, Events} =require("./database/db")
const eventRouter = require("./routes/eventRoute")
const authRouter = require("./routes/authRoute")
const usersRouter = require("./routes/usersRoute")
const cookieParser = require("cookie-parser")

const app = express();

app.use(cookieParser())
app.use("/users", usersRouter)
app.use("/auth", authRouter)
app.use("/events", eventRouter)



app.listen("3000", function(){
    console.log("app running on port 3000")
})
