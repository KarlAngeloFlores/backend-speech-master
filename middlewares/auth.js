const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/util");

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendError(res, 401, { message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    sendError(res, 403, { message: "Invalid or expired token" });
  }
};

module.exports = auth;