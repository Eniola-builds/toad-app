require('dns').setDefaultResultOrder('ipv4first');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const http = require('http');

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const initCronJobs = require('./services/cronService');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

connectDB();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Socket.io JWT Authentication Middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.id}`);
  socket.join(socket.user.id);

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.id}`);
  });
});

// Make `io` accessible in controllers via req.app.get('io')
app.set('io', io);

// Initialize Cron Jobs
initCronJobs(io);

app.get('/', (req, res) => res.redirect('/tasks'));
app.use('/', authRoutes);
app.use('/tasks', taskRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 8000;
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;