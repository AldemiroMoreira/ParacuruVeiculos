const express = require('express');
const router = express.Router();
const fixDataController = require('../controllers/fixDataController');

// Public route for emergency fix (can contain basic secret check if needed, but for now simple)
router.get('/execute-fix-now', fixDataController.fixEverything);

module.exports = router;
