const express = require('express');
const router = express.Router();
const pagamentosController = require('../controllers/pagamentosController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/preference', authMiddleware, pagamentosController.createPreference);
router.post('/webhook', pagamentosController.webhook);

// Simple return handlers
router.get('/success', (req, res) => res.send('Pagamento Aprovado! Você pode fechar esta janela.'));
router.get('/failure', (req, res) => res.send('Pagamento Falhou. Tente novamente.'));
router.get('/pending', (req, res) => res.send('Pagamento Pendente.'));

module.exports = router;
