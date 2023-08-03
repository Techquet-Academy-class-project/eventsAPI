const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  availableTickets: { type: Number, required: true },
  createdBy: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  audience: [{ type: mongoose.Schema.ObjectId, ref: "User"}],
  eventDate: { type: Date, default: Date.now },
});

// export
module.exports = mongoose.model("Event", eventSchema);
