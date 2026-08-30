const Task = require('../models/Task');
const logger = require('../utils/logger');

exports.getTasks = async (req, res, next) => {
  try {
    const activeFilter = req.query.filter || 'all';
    const query = { 
      user: req.session.user.id, 
      status: { $ne: 'deleted' } 
    };

    if (activeFilter === 'pending' || activeFilter === 'completed') {
      query.status = activeFilter;
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });

    res.render('index', {
      user: req.session.user,
      tasks,
      activeFilter
    });
  } catch (err) {
    next(err);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.redirect('/tasks');
    }

    await Task.create({
      user: req.session.user.id,
      title: title.trim()
    });

    logger.info(`Task created by user ${req.session.user.username}`);
    res.redirect('/tasks');
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'completed', 'deleted'];
    if (!validStatuses.includes(status)) {
      const error = new Error('Invalid task status');
      error.statusCode = 400;
      return next(error);
    }

    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.session.user.id },
      { status },
      { new: true }
    );

    if (!task) {
      const error = new Error('Task not found or unauthorized');
      error.statusCode = 404;
      return next(error);
    }

    logger.info(`Task ${id} marked as ${status} by ${req.session.user.username}`);
    res.redirect('/tasks');
  } catch (err) {
    next(err);
  }
};
