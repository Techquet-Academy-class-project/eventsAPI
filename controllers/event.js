const fs = require("fs/promises");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

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

//create an event
module.exports.createEvent = async (req, res) => {
  const events = await readEvent();
  events.push({
    ...req.body,
    _id: uuidv4(),
    createdBy: req.user._id,
    audience: [],
  });
  await fs.writeFile(
    path.join(__dirname, "../db/event.json"),
    JSON.stringify(events),
  );
  // update the users database
  const users = await readUser();
  const findUser = users.find((user) => user.email === req.user.email);
  const newEvent = events.find((event) => event.createdBy === req.user._id);
  findUser.events.push(newEvent._id);
  await fs.writeFile(
    path.join(__dirname, "../db/user.json"),
    JSON.stringify(users),
  );
  return res.status(200).json({ data: newEvent, success: true });
};

// get all events
module.exports.getAllEvents = async (req, res) => {
  const getEvents = await readEvent();
  if (!getEvents) return res.status(400).json({ message: "no event found" });
  return res.json({ data: getEvents, success: true });
};

// get all events with available tickets
module.exports.getAvailableEvents = async (req, res) => {
  const readEvents = await readEvent();
  const getEvents = readEvents.filter((event) => event.availableTickets !== 0);
  if (!getEvents) return res.status(400).json({ message: "no event found" });
  return res.json({ data: getEvents, success: true });
};

// get one event
module.exports.getEvent = async (req, res) => {
  const readEvents = await readEvent();
  const getEvents = readEvents.find((event) => event._id === req.params.id);
  if (!getEvents) return res.status(400).json({ message: "no event found" });
  return res.json({ data: getEvents, success: true });
};

// purchase an event's ticket
module.exports.purchaseTicket = async (req, res) => {
  const readEvents = await readEvent();
  const getEvents = readEvents.find((event) => event._id === req.params.id);
  if (!getEvents) return res.status(400).json({ message: "no event found" });
  if (+getEvents.createdBy === +req.user._id)
    return res
      .status(403)
      .json({ message: "you cannot purchase a ticket you created" });
  // check how many tickets are available
  if (getEvents.availableTickets === 0)
    return res.status(400).json({ message: "no available tickets" });

  // update the events database by updating the audience and the availabletickets
  getEvents.audience.push(req.user._id);
  getEvents.availableTickets = getEvents.availableTickets - 1;
  await fs.writeFile(
    path.join(__dirname, "../db/event.json"),
    JSON.stringify(readEvents),
  );

  // update the users ticket array
  const users = await readUser();
  const findUser = users.find((user) => user.email === req.user.email);
  const newEvent = readEvents.find((event) => event.createdBy === req.user._id);
  findUser.tickets.push(newEvent._id);
  await fs.writeFile(
    path.join(__dirname, "../db/user.json"),
    JSON.stringify(users),
  );
  return res.status(200).json({
    success: true,
    message: "ticket purchased successfully",
    availableTickets: getEvents.availableTickets,
  });
};

// get one event and the users who purchased the tickets
module.exports.getMyEvent = async (req, res) => {
  const readEvents = await readEvent();
  const getEvent = readEvents.find(
    (event) => event._id === req.params.id && event.createdBy === req.user._id,
  );
  if (!getEvent) return res.status(400).json({ message: "no event found" });
  //get the users who purchased the tickets
  const users = await readUser();
  const eventWithUser = getEvent.audience.map((person) => {
    return users.filter((user) => user._id === person);
  });
  return res
    .status(400)
    .json({ data: getEvent, audience: eventWithUser, success: true });
};

// update an event
module.exports.updateEvent = async (req, res) => {
  const readEvents = await readEvent();
  const getEvent = readEvents.find(
    (event) => event._id === req.params.id && event.createdBy === req.user._id,
  );
  if (!getEvent) return res.status(400).json({ message: "no event found" });
  getEvent.title = req.body.title;
  getEvent.date = req.body.date;
  getEvent.availableTickets = req.body.availableTickets;

  await fs.writeFile(
    path.join(__dirname, "../db/event.json"),
    JSON.stringify(readEvents),
  );
  return res.status(400).json({ data: getEvent, success: true });
};
