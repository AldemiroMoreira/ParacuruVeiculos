const express = require('express');
const router = express.Router();
const locationsController = require('../controllers/locationsController');

router.get('/states', locationsController.getStates);
router.get('/cities/:stateId', locationsController.getCities);

module.exports = router;
