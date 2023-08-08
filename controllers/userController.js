const { User } = require('../models/userModel');
const { asyncErrorhandler } = require('../async-errorhandler/async-errorhandler');


//get a user and all his events--unauth
module.exports.getAUser = asyncErrorhandler(async (req, res) => {
    const userId = req.params.userId;
    const user = await User.findOne({_id: userId}, {password: 0, tickets: 0}).populate('events', '-audience');
    console.log('After');
    if (!user) return res.status(404).json({ message: 'No user found', success: false });
    return res.status(201).json({ data: user, success: true });
});

//Get my profile--auth
module.exports.getMyProfile = asyncErrorhandler(async (req, res) => {
    const user = await User.findOne({ _id: req.authUser._id }).populate('events').populate('tickets');
    if (!user) return res.status(404).json({ message: 'Not found!', success: false });
    return res.status(200).json({ data: user, message: 'Your request was successful', success: true })

});

//Update my profile--auth
module.exports.updateMyProfile = asyncErrorhandler(async (req, res) => {
    //You can only update name and email
    const user = await req.authUser;
    //Check if the user exists
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (req.body.password || req.body.tickets || req.body.events) return res.status(401).json({ message: 'You can only update your name and email!!!', success: false});
    //Update user profile.
    await User.updateOne({ _id: user._id }, req.body);
    return res.status(200).json({ message: 'profile updated successfully!', success: true })
});






