const jwt = require("jsonwebtoken");
require("dotenv").config();
const fs = require("fs/promises");
const path = require("path");

// read User function
const readUser = async () => {
  const users = await fs.readFile(
    path.join(__dirname, "../db/user.json"),
    "utf-8",
  );
  return JSON.parse(users);
};
module.exports.auth = (req, res, next) => {
  const cookies = req.cookies;

  if (!cookies?.auth) return res.status(401).json({ message: "Unauthorized" });
  jwt.verify(
    cookies.auth,
    process.env.JWT_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
      const user = await readUser();
      const foundUser = user.find((user) => user._id === decoded.id);
      if (!foundUser) return res.status(401).json({ message: "Unauthorized" });
      req.user = foundUser;
      next();
    },
  );
};
