const { Op } = require("sequelize");
const { User } = require("../models/associations");
const { throwError } = require("../utils/util");
const sequelize = require("../config/db");

const trainerService = {
    getTrainees: async () => {
        try {
            
            const students = await User.findAll({where: { role: { [Op.ne]: 'trainer' } }});

            return {
                message: "Fetched students successfully",
                data: students
            }

        } catch (error) {
            throw error;
        }
    },

    approveTrainee: async (id) => {
        const transaction = await sequelize.transaction();
        try {
            const trainee = await User.findOne({ where: { id }, transaction });

            if (!trainee) {
                throwError("Trainee not found", 404, true);
            }

            await trainee.update({ status: "verified" }, { transaction });

            await transaction.commit();

            return {
                message: "The trainee has been updated",
                data: trainee,
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    deleteTrainee: async (id) => {
        const transaction = await sequelize.transaction();
        try {
            const trainee = await User.findOne({ where: { id }, transaction });

            if (!trainee) {
                throwError("Trainee not found", 404, true);
            }

            await trainee.destroy({ transaction });

            await transaction.commit();

            return { message: "Trainee deleted successfully", data: id };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

}

module.exports = trainerService;