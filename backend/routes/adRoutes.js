const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', adController.listAds);
router.get('/:id', adController.getAd);

// Protected Routes
router.post('/', authenticateToken, adController.uploadMiddleware, adController.createAd);

module.exports = router;
