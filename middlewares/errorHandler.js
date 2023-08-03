module.exports.errorHandler = (err, req, res, next) => {
  console.log(err);
  // mongodb validation error
  if (err.name === "ValidationError")
    return res.status(400).json({ error: err.message });
  if (err.code === 11000)
    return res.status(400).json({ error: "duplicate email" });

  // page not found error
  // if(res.statusCode === 404) return
  const status = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(status).json({ error: err.message });
  next();
};
