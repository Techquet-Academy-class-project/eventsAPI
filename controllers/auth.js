const jsonwebtoken = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

module.exports.createUser = async (req, res) => {
  const { password, ...others } = req.body;
  // Check for duplicate username
  // const duplicate = await User.findOne({ email });
  // if (duplicate) {
  //   return res.status(409).json({ message: "Duplicate username" });
  // }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10); // salt rounds
  const user = await User.create({ ...others, password: hashedPwd });
  if (user) {
    //created
    res
      .status(201)
      .json({ data: { name: user.name, email: user.email }, success: true });
  } else {
    res.status(400).json({ message: "Invalid user data received" });
  }
};

module.exports.login = async (req, res) => {
  const { email, password } = req.body;
  // Confirm data
  if (!email || !password)
    return res.status(400).json({ message: "All fields are required" });
  const user = await User.findOne({ email });
  if (!user)
    return res
      .status(401)
      .json({ message: "Authentication failed", success: false });
  const match = await bcrypt.compare(password, user?.password);
  if (!match)
    return res
      .status(401)
      .json({ message: "Authentication failed", success: false });
  // create a token
  const token = jsonwebtoken.sign(
    { id: user._id },
    process.env.JWT_TOKEN_SECRET,
    {
      expiresIn: "1h",
    },
  );

  // Create secure cookie with token
  res.cookie("auth", token, {
    httpOnly: true, //accessible only by web server
    secure: false, //for production set to true
    sameSite: "None", //cross-site cookie
    maxAge: 60 * 60 * 1000, //cookie expiry: set to match token
  });

  res.json({ message: "login successfull", success: true });
};
