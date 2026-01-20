const express = require('express');
const router = express.Router();
const anunciosController = require('../controllers/anunciosController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', anunciosController.getAnuncios);
router.get('/:id', anunciosController.getAnuncioById);

// Protected routes
router.post('/', authMiddleware, (req, res, next) => {
    upload.array('images', 9)(req, res, (err) => {
        if (err) {
            console.error("Multer Error:", err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'Arquivo muito grande. Máximo 5MB por imagem.' });
            }
            if (err.message && err.message.includes('Apenas imagens')) {
                return res.status(400).json({ error: err.message });
            }
            return res.status(400).json({ error: 'Erro no upload de imagens: ' + err.message });
        }
        next();
    });
}, anunciosController.createAnuncio);
// router.delete('/:id', authMiddleware, anunciosController.deleteAnuncio); // TODO: Add delete

module.exports = router;
