module.exports.errorHandler = (err, req, res, next) => {
  console.log(err);
  const status = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(status).json({ error: err.message });
  next();
};
