require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();
const { errorHandler } = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 3500;

// middlewares
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/auth", require("./routes/authRoute"));
app.use("/event", require("./routes/eventRoute"));
app.use("/user", require("./routes/userRoute"));

// error handling middleware
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
