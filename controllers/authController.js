const User = require('../models/User');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

exports.renderLogin = (req, res) => {
  res.render('login', { error: null });
};

exports.renderRegister = (req, res) => {
  res.render('register', { error: null });
};

exports.register = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.render('register', { error: 'Please fill in all fields' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render('register', { error: 'Username is already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashedPassword });

    logger.info(`New user registered: ${username}`);
    res.redirect('/login');
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      logger.warn(`Failed login attempt for nonexistent user: ${username}`);
      return res.render('login', { error: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Failed login attempt for user: ${username}`);
      return res.render('login', { error: 'Invalid username or password' });
    }

    req.session.user = {
      id: user._id,
      username: user.username
    };

    logger.info(`User authenticated: ${username}`);
    res.redirect('/tasks');
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  const user = req.session.user ? req.session.user.username : null;
  req.session.destroy((err) => {
    if (err) logger.error(`Logout error: ${err.message}`);
    if (user) logger.info(`User logged out: ${user}`);
    res.redirect('/login');
  });
};
