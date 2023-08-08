const fs = require("fs/promises");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// readuser function
const readUser = async () => {
  const users = await fs.readFile(
    path.join(__dirname, "../db/user.json"),
    "utf-8",
  );
  return JSON.parse(users);
};
module.exports.createUser = async (req, res) => {
  const { email, password, name } = req.body;
  if (!name || !password || !email) {
    return res
      .status(400)
      .json({ success: false, message: "no field must be empty" });
  }
  const users = await readUser();
  // email must be unique
  const checkUser = users.find((user) => user.email === email);
  if (checkUser) {
    return res
      .status(400)
      .json({ success: false, message: "email already taken" });
  }
  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds
  users.push({
    ...req.body,
    _id: uuidv4(),
    password: hashedPwd,
    events: [],
    tickets: [],
  });
  await fs.writeFile(
    path.join(__dirname, "../db/user.json"),
    JSON.stringify(users),
  );
  return res.status(201).json({ success: true, message: "user created" });
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "no field must be empty" });
  }
  // check if user exist in db
  const users = await readUser();
  const checkUser = users?.find((user) => user.email === email);
  if (!checkUser)
    return res
      .status(400)
      .json({ success: false, message: "Authentication Failed" });
  const match = await bcrypt.compare(password, checkUser?.password);
  if (!match)
    return res
      .status(401)
      .json({ message: "Authentication failed", success: false });
  // create a token
  const token = jwt.sign({ id: checkUser._id }, process.env.JWT_TOKEN_SECRET, {
    expiresIn: "1h",
  });

  // Create secure cookie with token
  res.cookie("auth", token, {
    httpOnly: true, //accessible only by web server
    secure: false, //for production set to true
    sameSite: "None", //cross-site cookie
    maxAge: 60 * 60 * 1000, //cookie expiry: set to match token
  });

  res.json({ message: "login successfull", success: true });
};
