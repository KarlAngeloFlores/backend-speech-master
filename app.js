require('dotenv').config();
const express = require('express');
const cors = require('cors');

const allowedOrigins = [
  'http://localhost:5173',
  'http://192.168.1.9:5173',
  'https://speechmaster.netlify.app',
];

const app = express();

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/auth', require('./routes/auth.routes'));
app.use('/trainer/quizzes', require('./routes/quizTrainer.routes'));
app.use('/trainee/quizzes', require('./routes/quizTrainee.routes'));
app.use('/trainee/openai', require('./routes/openai.routes'));
app.use('/trainee', require('./routes/trainee.routes'));
app.use('/trainer', require('./routes/trainer.routes'));
app.use('/module', require('./routes/module.routes'));
app.use('/chat', require('./routes/chat.routes'));

// Export app instance for server.js
module.exports = app;
