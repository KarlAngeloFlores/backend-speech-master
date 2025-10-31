const http = require('http');
const { Server } = require('socket.io');
const clc = require('cli-color');
const sequelize = require('./config/db');
const app = require('./app');
const chatSocket = require('./socket/chat.socket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'http://192.168.1.9:5173',
  'https://speechmaster.netlify.app',
  'https://frontend-speech-master.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

console.log('✅ Allowed Origins:', allowedOrigins);

const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      console.log(`🔍 Connection attempt from: ${origin || 'no-origin'}`);
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`❌ CORS blocked: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Type', 'Authorization']
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingInterval: 25000,
  pingTimeout: 60000
});

chatSocket(io);

(async () => {
  try {
    await sequelize.authenticate();
    console.log(clc.cyan('💾 Database connection established successfully'));

    server.listen(PORT, () => {
      console.log(clc.bgGreen.black(`✅ Server operational at http://localhost:${PORT}`));
      console.log(clc.yellow(`🔌 Socket.IO enabled with CORS for production`));
    });
  } catch (error) {
    console.error(clc.bgRed.white('❌ Database connection failed:'), error);
    process.exit(1);
  }
})();

module.exports = server;
