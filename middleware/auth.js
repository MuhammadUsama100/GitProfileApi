const jwt = require("jsonwebtoken");
const config = require("config");
module.exports = function(req, res, next) {
  // Get Tokken  from header
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(410).json({ msg: "No token , authorization denied" });
  }
  try {
    const decode = jwt.verify(token, config.get("jwtSecret"));
    req.user = decode.user;
    next();
  } catch (e) {
    res.status(410).json({ msg: "Token is not valid" });
  }
};
