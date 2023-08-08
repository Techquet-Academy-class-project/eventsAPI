module.exports.errorHandler = (err, req, res, next) => {
  console.log(err);
  // mongodb errors
  if (err.name === "ValidationError")
    return res.status(400).json({ error: err.message });
  if (err.code === 11000)
    return res.status(400).json({ error: "duplicate email" });
  if (err.kind === "ObjectId")
    return res.status(400).json({ error: "pls input a valid id" });

  // page not found error
  if (res.statusCode === 404)
    return res.status(404).json({ error: "page not found" });
  const status = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(status).json({ error: err.message });
  next();
};

