const cron = require('node-cron');
const Task = require('../models/Task');

function initCronJobs(io) {
  // Runs every minute to check for overdue tasks
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      // Find pending tasks whose due date has passed
      const overdueTasks = await Task.find({
        status: 'pending',
        due_date: { $lte: now }
      }).populate('user');

      for (let task of overdueTasks) {
        task.status = 'overdue';
        await task.save();

        if (!task.user) continue;

        const ownerId = task.user._id.toString();

        // Send real-time WebSocket notification to the specific task owner
        if (io) {
          io.to(ownerId).emit('task_overdue', {
            message: `Your task "${task.title}" is now overdue!`,
            taskId: task._id,
            due_date: task.due_date
          });
        }
      }
    } catch (err) {
      console.error('Error in overdue task cron job:', err);
    }
  });
}

module.exports = initCronJobs;