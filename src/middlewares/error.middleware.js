import colors from 'colors';

export default (err, _req, res, _next) => {
  console.error((err.message).red, err);
  res.status(err.status || 500).json({ msg: err.message || "Server error" });
};
