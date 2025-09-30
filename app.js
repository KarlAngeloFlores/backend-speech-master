require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const app = express();

const allowedOrigins = ['http://localhost:5173', 'http://192.168.1.9:5173'];

app.use(cors({
    origin: allowedOrigins
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

const quizTrainerRoutes = require("./routes/quizTrainer.routes");
app.use("/trainer/quizzes", quizTrainerRoutes);

const quiztraineeRoutes = require("./routes/quizTrainee.routes");
app.use("/trainee/quizzes", quiztraineeRoutes);

const openaiRoutes = require("./routes/openai.routes");
app.use("/trainee/openai", openaiRoutes);

const trainerRoutes = require("./routes/trainer.routes");
app.use("/trainer", trainerRoutes);

const moduleRoutes = require("./routes/module.routes");
app.use("/module", moduleRoutes);

module.exports = app;