const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Task description cannot be empty'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'deleted'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
