require('dns').setDefaultResultOrder('ipv4first');
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

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
  store: new (require('express-session').Store)(),

  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.get('/', (req, res) => res.redirect('/tasks'));
app.use('/', authRoutes);
app.use('/tasks', taskRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 8000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
