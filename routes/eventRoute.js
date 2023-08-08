const express = require("express");
const router = express.Router();

const {
  createEvent,
  getAllEvents,
  purchaseTicket,
  getAvailableEvents,
  getEvent,
  getMyEvent,
  updateEvent,
} = require("../controllers/event");
const { auth } = require("../middlewares/jwtAuth");

router.post("/", auth, createEvent);
router.get("/", getAllEvents);
router.get("/:id", getEvent);
router.put("/:id", auth, updateEvent);
router.get("/available", getAvailableEvents);
router.get("/purchase/:id", auth, purchaseTicket);
router.get("/myevent/:id", auth, getMyEvent);
module.exports = router;
