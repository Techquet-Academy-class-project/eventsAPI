const express = require('express');
const {User} = require('./models/userModel')
const {event} = require('./models/eventModel')


const authRouter = require('./routes/authRoute')
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config()
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


//Create server
const app = express();


app.use(cors())
app.use(cookieParser());


//Mounting the routers


app.use('/auth', authRouter);


const PORT = process.env.PORT || 4040
app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`))
