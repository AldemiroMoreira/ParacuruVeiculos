const express = require('express');
const router = express.Router();
const { Categoria, Plano, Fabricante, Modelo } = require('../../models');

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

// CRUD Fabricantes
router.get('/fabricantes', async (req, res) => {
    try {
        const fabricantes = await Fabricante.findAll({ order: [['nome', 'ASC']] });
        res.json(fabricantes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/fabricantes', async (req, res) => {
    try {
        const { nome, logo_url } = req.body;
        const newFab = await Fabricante.create({ nome, logo_url });
        res.json(newFab);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/fabricantes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, logo_url } = req.body;
        await Fabricante.update({ nome, logo_url }, { where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/fabricantes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Fabricante.destroy({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CRUD Modelos
router.get('/modelos', async (req, res) => {
    try {
        // Include associations for display
        const modelos = await Modelo.findAll({
            include: [
                { model: Fabricante },
                { model: Categoria }
            ],
            order: [['nome', 'ASC']]
        });
        res.json(modelos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/modelos', async (req, res) => {
    try {
        const { nome, fabricante_id, categoria_id } = req.body;
        const newMod = await Modelo.create({ nome, fabricante_id, categoria_id });
        res.json(newMod);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/modelos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, fabricante_id, categoria_id } = req.body;
        await Modelo.update({ nome, fabricante_id, categoria_id }, { where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/modelos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Modelo.destroy({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ... existing code ...

// FULL DATABASE RESET (DANGEROUS)
const { seedEverything } = require('../../seed_everything');

router.post('/reset_full', async (req, res) => {
    try {
        console.log('API Request: FULL DATABASE RESET initiated.');
        await seedEverything();
        res.json({ success: true, message: 'Database reset and seeded successfully.' });
    } catch (e) {
        console.error('Reset Failed:', e);
        res.status(500).json({ success: false, message: 'Reset failed: ' + e.message });
    }
});


module.exports = router;
