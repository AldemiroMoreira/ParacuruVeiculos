const express = require('express');
const router = express.Router();
const { Categoria, Plano } = require('../../models');

// Middleware to check specific secret/password for 2nd layer auth
// For MVP, we will verify this in the login endpoint and issue a temporary token or just trust the frontend for now if session based?
// Let's stick to a simple password check on the Login endpoint that returns a "session" flag or token.
// Actually, for a robust "sub-project", let's use a specialized middleware here.

const ADMIN_SECRET = 'admin123'; // Hardcoded for MVP as requested

router.post('/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_SECRET) {
        return res.json({ success: true, token: 'validated_admin_token' });
    }
    return res.status(401).json({ success: false, message: 'Senha incorreta' });
});

// CRUD Categorias
router.get('/categorias', async (req, res) => {
    try {
        const categorias = await Categoria.findAll({ order: [['id', 'ASC']] });
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/categorias', async (req, res) => {
    try {
        const { nome } = req.body;
        const newCat = await Categoria.create({ nome });
        res.json(newCat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/categorias/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome } = req.body;
        await Categoria.update({ nome }, { where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/categorias/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Categoria.destroy({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CRUD Planos
router.get('/planos', async (req, res) => {
    try {
        const planos = await Plano.findAll({ order: [['preco', 'ASC']] });
        res.json(planos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/planos', async (req, res) => {
    try {
        const { nome, duracao_dias, preco } = req.body;
        const newPlano = await Plano.create({ nome, duracao_dias, preco });
        res.json(newPlano);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/planos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, duracao_dias, preco } = req.body;
        await Plano.update({ nome, duracao_dias, preco }, { where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/planos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Plano.destroy({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
