const Event = require("../models/Event");
const User = require("../models/User");

//create  an event
module.exports.createEvent = async (req, res) => {
  const newEvent = await Event.create({ ...req.body, createdBy: req.user._id });
  // update the users database
  await User.updateOne(
    { email: req.user.email },
    { $push: { events: newEvent._id } },
  );
  return res.status(200).json({ data: newEvent, success: true });
};

// get all events
module.exports.getAllEvents = async (req, res) => {
  const getEvents = await Event.find();
  if (!getEvents) return res.status(200).json({ message: "no event found" });
  return res.json({ data: getEvents, success: true });
};

// get all events with available tickets
module.exports.getAvailableEvents = async (req, res) => {
  const getEvents = await Event.find({ availableTickets: { $ne: 0 } });
  if (!getEvents) return res.status(200).json({ message: "no event found" });
  return res.json({ data: getEvents, success: true });
};

// get one event
module.exports.getEvent = async (req, res) => {
  const getEvents = await Event.findOne({ _id: req.params.id });
  if (!getEvents) return res.status(200).json({ message: "no event found" });
  return res.json({ data: getEvents, success: true });
};
// purchase an event's ticket
module.exports.purchaseTicket = async (req, res) => {
  const getEvents = await Event.findOne({ _id: req.params.id });
  if (!getEvents) return res.status(400).json({ message: "no event found" });
  if (getEvents.createdBy.equals(req.user._id))
    return res
      .status(403)
      .json({ message: "you cannot purchase a ticket you created" });
  // check how many tickets are available
  if (getEvents.availableTickets === 0)
    return res.status(400).json({ message: "no available tickets" });

  // update the events database by updating the audience and the availabletickets
  let { audience } = getEvents;
  audience.push(req.user._id);
  getEvents.availableTickets = getEvents.availableTickets - 1;
  await getEvents.save();
  console.log(getEvents);

  // update the users ticket array
  await User.updateOne(
    { email: req.user.email },
    { $push: { tickets: getEvents._id } },
  );
  return res.status(200).json({
    success: true,
    message: "ticket purchased successfully",
    availableTickets: getEvents.availableTickets,
  });
};

// get one event and the users who purchased the tickets
module.exports.getMyEvent = async (req, res) => {
  const getEvent = await Event.findOne({
    _id: req.params.id,
    createdBy: req.user._id,
  }).populate("audience");
  if (!getEvent) return res.status(200).json({ message: "no event found" });
  return res.json({ data: getEvent, success: true });
};

// update an event
module.exports.updateEvent = async (req, res) => {
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true },
  );
  if (!event) return res.status(400).json({ message: "event not found o" });
  return res.json({ data: event, success: true });
};
