const { logSuccessMiddleware } = require("../utils/logs");
const { sendError } = require("../utils/util");

const checkRole = (requiredRole) => (req, res, next) => {
    if(req.user && req.user.role === requiredRole) {
        logSuccessMiddleware("CHECK ROLE: ", req.user.role);
        next(); //proceeds to next auth
    } else {
        sendError(res, 403, {message: "Forbidden"});
    }
};

module.exports = checkRole;