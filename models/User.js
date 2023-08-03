const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
    validate: [validator.isEmail, "invalid email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
  previousPassword: {
    type: String,
  },
  events: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Event",
    },
  ],
  tickets: {
    type: [String],
  },
});

module.exports = mongoose.model("User", userSchema);
