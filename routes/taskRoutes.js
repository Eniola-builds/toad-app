const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { ensureAuth } = require('../middleware/auth');

router.use(ensureAuth);

router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.post('/:id/status', taskController.updateStatus);

module.exports = router;
