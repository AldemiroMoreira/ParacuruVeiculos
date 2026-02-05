const express = require('express');
const router = express.Router();
const mlAuthController = require('../controllers/mlAuthController');

router.get('/auth-url', mlAuthController.getAuthUrl);
router.get('/callback', mlAuthController.handleCallback);

module.exports = router;
