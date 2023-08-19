const { asyncErrorhandler } = require('../async-errorhandler/async-errorhandler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fs = require('fs/promises');
const { v4: uuidv4 } = require('uuid')

//Create a user--signup
module.exports.signup = asyncErrorhandler(async (req, res) => {
    const { password, ...others } = req.body;
    if (!others.name || !others.email || !password) return res.status(400).json({ message: 'name, email and password are required' })
    //Check for password length
    if (password.length < 6) return res.json({ message: 'password length must be greater than 5!', success: false })
    // const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, 10);
    // const user = await User.create({ ...others, password: hashedPassword });
    const jsonDatabase = await fs.readFile(__dirname + '/../database/users.json', 'utf-8');
    const userDatabase = JSON.parse(jsonDatabase);
    const uniqueEmail = userDatabase.find((user) => user.email === others.email)
    if (uniqueEmail) return res.status(400).json({ message: 'This email already exists, try another one', success: false });
    const user = { ...others, password: hashedPassword, lastChangedPassword: new Date(), _id: uuidv4(), tickets: [], events: [] }
    userDatabase.push(user);
    //Save details in the database
    await fs.writeFile(__dirname + '/../database/users.json', JSON.stringify(userDatabase));
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
    if (!email || !password || (!email && !password) || Object.keys(req.body).length > 2) return res.status(500).json({ message: 'You must provide email and password only!!!' })
    if (password.length < 6) return res.status(500).json({ sucess: false, message: 'password length must be greater than 5!' });
    const jsonDatabase = await fs.readFile(__dirname + '/../database/users.json', 'utf-8');
    const userDatabase = JSON.parse(jsonDatabase);
    //Find the user
    const user = userDatabase.find((user) => user.email === email);
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
    return res.status(200).json({ data: user, yourToken: token, success: true, message: 'Login was successful!' });

});


//Logout
module.exports.logout = asyncErrorhandler(async (req, res) => {
    res.cookie('authorization', '', { maxAge: 1 });
    return res.status(200).json({ message: 'Logout successful!!!', success: true })
});

//Change Password
module.exports.changePassword = asyncErrorhandler(async (req, res) => {
    if (req.body.password.length < 6) return res.status(401).json({ message: 'Password must be greater than 6', success: false });
    if (Object.keys(req.body).length > 2) return res.status(500).json({ message: 'You are required to provide only the password field' })
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    //Read the user database
    const jsonDatabase = await fs.readFile(__dirname + '/../database/users.json', 'utf-8');
    const userDatabase = JSON.parse(jsonDatabase);
    //Find the userindex in the database
    const userIndex = userDatabase.findIndex((user) => user._id === req.authUser._id);
    userDatabase[userIndex].password = hashedPassword;
    userDatabase[userIndex].lastChangedPassword = Date.now();
    await fs.writeFile(__dirname + '/../database/users.json', JSON.stringify(userDatabase));
    // await User.updateOne({_id: req.authUser._id}, {password: hashedPassword, lastChangedPassword: Date.now()})
    return res.status(200).json({ message: 'Password successfully updated!!!', success: true })
});