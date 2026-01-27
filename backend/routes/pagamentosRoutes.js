const express = require('express');
const router = express.Router();
const pagamentosController = require('../controllers/pagamentosController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/preference', authMiddleware, pagamentosController.createPreference);
router.post('/webhook', pagamentosController.webhook);

// Simple return handlers
// Simple return handlers - Redirect to Frontend
router.get('/success', (req, res) => res.redirect('/#/my-ads?status=success'));
router.get('/failure', (req, res) => res.redirect('/#/checkout?status=failure'));
router.get('/pending', (req, res) => res.redirect('/#/my-ads?status=pending'));

module.exports = router;
