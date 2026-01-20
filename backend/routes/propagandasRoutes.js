const express = require('express');
const router = express.Router();
const propagandasController = require('../controllers/propagandasController');

router.get('/', propagandasController.getAds);
router.post('/:id/click', propagandasController.clickAd);

// Admin route placeholder
// router.post('/', authMiddleware, adminMiddleware, propagandasController.createAd);

module.exports = router;
