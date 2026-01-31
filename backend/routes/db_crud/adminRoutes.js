const express = require('express');
const router = express.Router();
const { Categoria, Plano, Fabricante, Modelo, Usuario } = require('../../models');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendEmail } = require('../../utils/emailService');

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



// CRUD Usuários
router.get('/users', async (req, res) => {
    try {
        const users = await Usuario.findAll({ order: [['id', 'DESC']] });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/users', async (req, res) => {
    try {
        const { nome, email, password, isAdmin, isVerified, isBanned } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        // If not verified, generate token
        let activationToken = null;
        if (!isVerified) {
            activationToken = crypto.randomBytes(20).toString('hex');
        }

        const newUser = await Usuario.create({
            nome,
            email,
            password_hash: hashedPassword,
            isAdmin: isAdmin || false,
            isVerified: isVerified || false,
            isBanned: isBanned || false,
            activationToken: activationToken
        });

        // Send Email if not verified
        if (!isVerified && activationToken) {
            const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
            const activationUrl = `${baseUrl}/#/activate/${activationToken}`;
            const logoUrl = `${baseUrl}/favicon.svg`;

            const htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #0ea5e9; padding: 20px; text-align: center;">
                        <img src="${logoUrl}" alt="Paracuru Veículos" style="width: 50px; height: 50px; background-color: white; border-radius: 50%; padding: 5px;">
                        <h1 style="color: white; margin: 10px 0 0; font-size: 24px;">Paracuru Veículos</h1>
                    </div>
                    <div style="padding: 30px;">
                        <h2 style="color: #333;">Olá, ${nome}!</h2>
                        <p style="color: #555; font-size: 16px; line-height: 1.5;">
                            Sua conta foi criada com sucesso por um de nossos administradores.
                        </p>
                        <p style="color: #555; font-size: 16px; line-height: 1.5;">
                            Para definir sua senha e acessar sua conta, por favor confirme seu email clicando no botão abaixo:
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${activationUrl}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                                Ativar Minha Conta
                            </a>
                        </div>
                        <p style="color: #777; font-size: 14px; text-align: center;">
                            Se o botão não funcionar, copie e cole o link abaixo no seu navegador:<br>
                            <a href="${activationUrl}" style="color: #0ea5e9;">${activationUrl}</a>
                        </p>
                    </div>
                    <div style="background-color: #f8f9fa; padding: 15px; text-align: center; color: #888; font-size: 12px;">
                        © ${new Date().getFullYear()} Paracuru Veículos. Todos os direitos reservados.
                    </div>
                </div>
            `;

            await sendEmail({
                to: email,
                subject: 'Ativação de Conta - ParacuruVeículos',
                html: htmlContent
            });
        }

        res.json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, password, isAdmin, isVerified, isBanned } = req.body;

        const user = await Usuario.findByPk(id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.nome = nome;
        user.email = email;
        if (password) {
            user.password_hash = await bcrypt.hash(password, 10);
        }
        user.isAdmin = isAdmin;
        user.isVerified = isVerified;
        user.isBanned = isBanned;

        await user.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Usuario.destroy({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
