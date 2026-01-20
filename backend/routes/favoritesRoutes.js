const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoritesController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require auth
router.use(authMiddleware);

router.post('/toggle', favoritesController.toggleFavorite);
router.get('/', favoritesController.getFavorites);
router.get('/ids', favoritesController.checkFavoriteStatus);

module.exports = router;
