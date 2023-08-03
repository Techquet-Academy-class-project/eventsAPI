const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

module.exports.auth = (req, res, next) => {
  const cookies = req.cookies;

  if (!cookies?.auth) return res.status(401).json({ message: "Unauthorized" });
  jwt.verify(
    cookies.auth,
    process.env.JWT_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
      const foundUser = await User.findOne({ _id: decoded.id });

      if (!foundUser) return res.status(401).json({ message: "Unauthorized" });

      req.user = foundUser;
    },
  );
  next();
};
