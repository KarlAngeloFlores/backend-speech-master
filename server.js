const http = require('http');
const { Server } = require('socket.io');
const clc = require('cli-color');
const sequelize = require('./config/db');
const app = require('./app'); // import Express app
const chatSocket = require('./socket/chat.socket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'http://192.168.1.9:5173',
  'https://speechmaster.netlify.app',
  'https://frontend-speech-master.vercel.app'
];

const io = new Server(server, { cors: { origin: allowedOrigins, credentials: true }, transports: ['websocket', 'polling'] });
// Initialize chat socket
chatSocket(io);

// Initialize DB + Server
(async () => {
  try {
    await sequelize.authenticate();
    console.log(clc.cyan('💾 Database connection established successfully'));

    server.listen(PORT, () => {
      console.log(clc.bgGreen.black(`✅ Server operational at http://localhost:${PORT}`));
    });
  } catch (error) {
    console.error(clc.bgRed.white('❌ Database connection failed:'), error);
  }
})();
