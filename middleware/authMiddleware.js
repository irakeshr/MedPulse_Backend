const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(req.headers)
  console.log("AUTH HEADER:", authHeader);

  if (!authHeader) {
    return res.status(401).json("No token provided");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json("Token malformed");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json("Invalid token");
  }
};
