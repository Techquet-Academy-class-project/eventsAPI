const express = require("express");
const router = express.Router();

const {
  getUser,
  getUsersTickets,
  getUsersEvents,
  getCurrentUserEvents,
  getUserProfile,
  updateUserPassword,
  updateUserProfile,
} = require("../controllers/user");
const { auth } = require("../middlewares/jwtAuth");

router.get("/tickets", auth, getUsersTickets);
router.get("/events", auth, getUsersEvents);
router.get("/myevents", auth, getCurrentUserEvents);
router.get("/user/:id", getUser);
router.get("/myprofile", auth, getUserProfile);
router.put("/update/myprofile", auth, updateUserProfile);
router.put("/update/security", auth, updateUserPassword);

module.exports = router;
