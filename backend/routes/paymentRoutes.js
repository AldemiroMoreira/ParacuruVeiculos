const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

// Create Preference (Protected)
router.post('/create_preference', authenticateToken, paymentController.createPreference);

// Webhook (Public, called by Mercado Pago)
router.post('/webhook', paymentController.webhook);

module.exports = router;
