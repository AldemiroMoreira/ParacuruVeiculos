const express = require('express');
const router = express.Router();
const propagandasController = require('../controllers/propagandasController');

// Public routes
router.get('/', propagandasController.getPropagandas);
router.post('/:id/click', propagandasController.clickPropaganda);

module.exports = router;
