const express = require('express');
const router = express.Router();
const resourcesController = require('../controllers/resourcesController');

router.get('/fabricantes', resourcesController.getFabricantes);
router.get('/modelos/:fabricanteId', resourcesController.getModelos);
router.get('/categorias', resourcesController.getCategorias);
router.get('/planos', resourcesController.getPlanos);

module.exports = router;
