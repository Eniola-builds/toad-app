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
  due_date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'overdue'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);