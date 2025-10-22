const { Quiz, QuizQuestion, User } = require("../models/associations");
const sequelize = require("../config/db");
const { throwError } = require("../utils/util");
const { logInfo } = require('../utils/logs');
const sgMail = require("@sendgrid/mail");

const quizTrainerService = {
    createQuiz: async (type, title, total_points, timer_seconds, created_by, questions) => {

        const transaction = await sequelize.transaction();
        try {
            questions.forEach((q, idx) => {
                const currentNo = idx + 1;
                const word = q.question_word;

                if(!q.question_word || q.question_word.trim() === "") {
                    throwError(`Question word is missing at no.: ${currentNo}`, 404, true);
                };

                if (/\d/.test(q.question_word)) {
                    throwError(`Question word contains numbers at no.: ${currentNo}: "${word}"`, 404, true);
                };
            });

            const quiz = await Quiz.create({ type, title, total_points, timer_seconds, created_by }, { transaction });
            logInfo(quiz.id);
            const quiz_id = quiz.id;
            

            const questionValues = questions.map((q) => ({
            quiz_id,
            question_word: q.question_word.toLowerCase().trim(),
            difficulty: q.difficulty
            }));

            logInfo(questionValues);
            const frontend_url = process.env.CLIENT_URL;

                        //add email notification
            const users = await User.findAll({
                where: { status: "verified", role: "trainee" },
                attributes: ["email"],
                transaction
            });

            if (users && users.length > 0) { 
                const emails = users.map((u) => ({ email: u.email }));
                
                const subject = "New Quiz Available!";
                const message = `A new quiz titled "${title}" has been created. Log in to your account to take the quiz!`;

                await sgMail.send({
                    from: process.env.EMAIL,
                    personalizations: [{
                        to: process.env.EMAIL,
                        bcc: emails,
                    }],
                    subject,
                    html: `
                              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border-radius: 12px; background: #ffffff; border: 1px solid #e0e0e0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <h2 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">
              ${subject}
            </h2>
            <p style="font-size: 16px; color: #555; line-height: 1.6; margin: 0 0 20px 0;">
              ${message}
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${frontend_url}" style="background: #3498db; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; display: inline-block;">
                Visit Site
              </a>
            </div>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 14px; color: #888; text-align: center; margin: 0 0 6px 0;">
              This is an automated email. Please do not reply.
            </p>
            <p style="font-size: 12px; color: #aaa; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} Projexlify. All rights reserved.
            </p>
          </div>`
                })
            } 
            
            await QuizQuestion.bulkCreate(questionValues, { transaction });
            await transaction.commit();



            return {
                message: "Quiz created successfully",
                data: quiz
            }
            
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    deleteQuiz: async (id) => {
        const transaction = await sequelize.transaction();
        try {

            const quiz = await Quiz.findOne({ where: { id } });

            if(!quiz) {
                throwError("Quiz not found", 400, true);
            };

            await quiz.destroy({ transaction });
            await transaction.commit();

            return {
                message: "Quiz deleted successfully",
                data: id
            };
            
        } catch (error) {
            await transaction.rollback();
            throw error;
        };
    },

    getAllQuizzes: async () => {
        try {
            
            const quizzes = await Quiz.findAll();

            return {
                quizzes,
                message: "Fetched quizzes successfully"
            }

        } catch (error) {
            throw error;
        }
    },

    getQuizResult: async (id) => {
        try {
            
            const [quiz_results] = await sequelize.query(`SELECT 
                u.id AS user_id, 
                u.first_name, 
                u.last_name, 
                u.middle_name, 
                qs.quiz_id, 
                qs.score, 
                qs.taken_at
            FROM user u
            LEFT JOIN quiz_score qs ON u.id = qs.user_id
            AND qs.quiz_id = ? 
            WHERE u.role = 'trainee' AND u.status = 'verified';`, { replacements: [id] });

            const quiz_info = await Quiz.findOne({ where: { id } });

            if(!quiz_info) {
                throwError("Quiz not found", 404, true);
            }
            
            return {
                message: "Fetched quiz result successfully",
                quiz_results,
                quiz_info
            }

        } catch (error) {
            throw error;
        }
    }
}

module.exports = quizTrainerService;