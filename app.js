require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Allowed origins - add environment variable for flexibility
const allowedOrigins = [
  'http://localhost:5173',
  'http://192.168.1.9:5173',
  'https://speechmaster.netlify.app',
  'https://frontend-speech-master.vercel.app',
  process.env.FRONTEND_URL, // Add from environment
].filter(Boolean); // Remove undefined values

const app = express();

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Express CORS blocked: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
