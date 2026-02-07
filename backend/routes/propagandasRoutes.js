const express = require('express');
const router = express.Router();
const propagandasController = require('../controllers/propagandasController');

// Public routes
router.get('/', propagandasController.getPropagandas);
router.post('/:id/click', propagandasController.clickPropaganda);

// Admin Routes
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

router.get('/all', authMiddleware, propagandasController.getAllPropagandas);

// Multer Config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../public/img/ads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'ad-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.post('/', authMiddleware, upload.single('imagem'), propagandasController.createPropaganda);
router.put('/:id', authMiddleware, upload.single('imagem'), propagandasController.updatePropaganda);
router.delete('/:id', authMiddleware, propagandasController.deletePropaganda);

// Bulk Actions
router.get('/export-links', authMiddleware, propagandasController.exportLinks);
router.post('/import-links', authMiddleware, propagandasController.importLinks);

module.exports = router;
