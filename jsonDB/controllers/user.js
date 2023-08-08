const fs = require("fs/promises");
const path = require("path");
const bcrypt = require("bcryptjs");

// readuser function
const readUser = async () => {
  const users = await fs.readFile(
    path.join(__dirname, "../db/user.json"),
    "utf-8",
  );
  return JSON.parse(users);
};
// read event function
const readEvent = async () => {
  const events = await fs.readFile(
    path.join(__dirname, "../db/event.json"),
    "utf-8",
  );
  return JSON.parse(events);
};

// get a user and the events he created
module.exports.getUser = async (req, res) => {
  const users = await readUser();
  const getUser = users.find((user) => user._id === req.params.id);
  if (!getUser) return res.status(400).json({ message: "user not found" });
  // get the users event
  const getEvent = await readEvent();
  const userEvents = getUser.events.map((event) => {
    return getEvent.filter((foundEvent) => foundEvent._id === event);
  });
  return res.json({ data: getUser, events: userEvents, success: true });
};

// get users and their purchased tickets
module.exports.getUsersTickets = async (req, res) => {
  const users = await readUser();
  if (!users) return res.status(400).json({ message: "user not found" });
  const result = users.map((user) => ({
    name: user.name,
    tickets: user.tickets,
  }));
  return res.json({ data: result, success: true });
};

// get users and events
module.exports.getUsersEvents = async (req, res) => {
  const users = await readUser();
  if (!users) return res.status(400).json({ message: "user not found" });
  // get the users event
  const getEvent = await readEvent();
  const userEvents = users.flatMap((user) =>
    user.events.flatMap((event) => {
      return getEvent.filter((foundEvent) => foundEvent._id === event);
    }),
  );
  const result = users.map((user) => ({
    name: user.name,
    events: userEvents,
  }));
  return res.json({ data: result, success: true });
};

//get all the event of the current user
module.exports.getCurrentUserEvents = async (req, res) => {
  const users = await readUser();
  const getUser = users.find((user) => user._id === req.user._id);
  if (!getUser) return res.status(400).json({ message: "user not found" });
  // get the users event
  const getEvent = await readEvent();
  const userEvents = getUser.events.map((event) => {
    return getEvent.filter((foundEvent) => foundEvent._id === event);
  });
  return res.json({ data: getUser, events: userEvents, success: true });
};

// get user profile
module.exports.getUserProfile = async (req, res) => {
  const users = await readUser();
  const getUser = users.find((user) => user._id === req.user._id);
  if (!getUser) return res.status(400).json({ message: "user not found" });
  const { password, ...others } = getUser;
  return res.json({ data: others, success: true });
};

//update user profile
module.exports.updateUserProfile = async (req, res) => {
  if (req.body.password)
    return res.status(400).json("you can only update email or name");
  const users = await readUser();
  const getUser = users.find((user) => user._id === req.user._id);
  if (!getUser) return res.status(400).json({ message: "user not found" });
  if (req.body.name) getUser.name = req.body.name;
  if (req.body.email) getUser.email = req.body.email;
  await fs.writeFile(
    path.join(__dirname, "../db/user.json"),
    JSON.stringify(users),
  );
  return res.json({ data: getUser, success: true });
};

// update user passwsord
module.exports.updateUserPassword = async (req, res) => {
  if (req.body.name || req.body.email)
    return res.status(400).json("you can only update password");
  const users = await readUser();
  const getUser = users.find((user) => user._id === req.user._id);
  if (!getUser) return res.status(400).json({ message: "user not found" });
  const hashedPwd = await bcrypt.hash(req.body.password, 10); // salt rounds
  getUser.password = hashedPwd;
  await fs.writeFile(
    path.join(__dirname, "../db/user.json"),
    JSON.stringify(users),
  );

  // logout the user
  res.clearCookie("auth", { httpOnly: true, sameSite: "None", secure: true });
  return res.json({
    data: getUser,
    success: true,
    status: "you have been logged out, login again with your new password",
  });
};
