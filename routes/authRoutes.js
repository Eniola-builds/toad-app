const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { forwardAuth } = require('../middleware/auth');

router.get('/login', forwardAuth, authController.renderLogin);
router.post('/login', authController.login);
router.get('/register', forwardAuth, authController.renderRegister);
router.post('/register', authController.register);
router.get('/logout', authController.logout);

module.exports = router;
