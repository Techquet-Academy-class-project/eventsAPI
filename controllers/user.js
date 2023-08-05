const User = require("../models/User");

// get a user and the events he created
module.exports.getUser = async (req, res) => {
  const getUser = await User.findOne(
    { _id: req.params.id },
    "-tickets",
  ).populate("events");
  if (!getUser) return res.status(200).json({ message: "user not found" });
  return res.json({ data: getUser, success: true });
};

// get users and their purchased tickets
module.exports.getUsersTickets = async (req, res) => {
  const getUser = await User.find().lean();
  if (!getUser) return res.status(200).json({ message: "user not found" });
  const result = getUser.map((user) => ({
    name: user.name,
    tickets: user.tickets,
  }));
  return res.json({ data: result, success: true });
};

// get users and events
module.exports.getUsersEvents = async (req, res) => {
  const getUser = await User.find().populate("events");
  if (!getUser) return res.status(200).json({ message: "user not found" });
  const result = getUser.map((user) => ({
    name: user.name,
    events: user.events,
  }));
  return res.json({ data: result, success: true });
};

//get all the event of the current user
module.exports.getCurrentUserEvents = async (req, res) => {
  const getUser = await User.findOne({ _id: req.user._id }).populate("events");
  if (!getUser) return res.status(200).json({ message: "user not found" });
  return res.json({ data: getUser, success: true });
};

// get user profile
module.exports.getUserProfile = async (req, res) => {
  const getUser = await User.findOne({ _id: req.user._id }, "-password");
  if (!getUser) return res.status(200).json({ message: "user not found" });
  return res.json({ data: getUser, success: true });
};

//update user profile
module.exports.updateUserProfile = async (req, res) => {
  if (req.body.password)
    return res.status(400).json("you can only update email or name");
  const getUser = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: req.body },
    { new: true },
  );
  if (!getUser) return res.status(200).json({ message: "user not found" });
  return res.json({ data: getUser, success: true });
};

// update user passwsord
module.exports.updateUserPassword = async (req, res) => {
  if (req.body.name || req.body.email)
    return res.status(400).json("you can only update password");
  const getUser = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: req.body },
    { new: true },
  );
  if (!getUser) return res.status(200).json({ message: "user not found" });

  // logout the user
  res.clearCookie("auth", { httpOnly: true, sameSite: "None", secure: true });
  return res.json({
    data: getUser,
    success: true,
    status: "you have been logged out, login again with your new password",
  });
};
