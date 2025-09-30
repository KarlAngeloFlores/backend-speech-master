const User = require("../models/user.model");
const { throwError } = require("../utils/util");

const userService = {
    getUser: async (id) => {
        try {
            
            const user = await User.findOne({where: { id }});
            if(!user) {
                throwError("User not found", 404, true);
            }

            return {
                message: "User fetched successfully",
                data: user
            };

        } catch (error) {
            throw error;
        }
    }
}

module.exports = userService;