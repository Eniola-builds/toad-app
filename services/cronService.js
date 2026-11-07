const cron = require('node-cron');
const Task = require('../models/Task');
// Uncomment if you have an email utility set up:
// const sendEmail = require('../utils/sendEmail');

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

        // 1. Send Real-time WebSocket notification to the task owner only
        io.to(ownerId).emit('task_overdue', {
          message: `Your task "${task.title}" is now overdue!`,
          taskId: task._id,
          due_date: task.due_date
        });

        // 2. Send Email notification (optional/if mailer is configured)
        /*
        if (task.user.email) {
          await sendEmail({
            to: task.user.email,
            subject: 'Task Overdue Alert',
            text: `Hello, your task "${task.title}" has reached its due date and is now marked as overdue.`
          });
        }
        */
      }
    } catch (err) {
      console.error('Error in overdue task cron job:', err);
    }
  });
}

module.exports = initCronJobs;