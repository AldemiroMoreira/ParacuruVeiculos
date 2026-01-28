const { Anuncio, Payment, Usuario } = require('../models');

exports.getRecentAds = async (req, res) => {
    try {
        const ads = await Anuncio.findAll({
            limit: 10,
            order: [['created_at', 'DESC']],
            include: [{ model: Usuario, attributes: ['nome', 'email'] }]
        });
        res.status(200).json(ads);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllAds = async (req, res) => {
    try {
        const ads = await Anuncio.findAll({
            order: [['created_at', 'DESC']],
            include: [{ model: Usuario, attributes: ['nome', 'email'] }]
        });
        res.status(200).json(ads);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const totalAnuncios = await Anuncio.count();
        const totalPagos = await Anuncio.count({ where: { status: 'active' } }); // Assuming active = paid
        const totalPendentes = await Anuncio.count({ where: { status: 'pending_payment' } });

        // Sum total revenue
        const totalFaturadoRaw = await Payment.sum('amount', { where: { status: 'approved' } });
        const totalFaturado = totalFaturadoRaw || 0;

        res.status(200).json({
            totalAnuncios,
            totalPagos,
            totalPendentes,
            totalFaturado
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.approveAd = async (req, res) => {
    try {
        const { id } = req.params;
        await Anuncio.update({ status: 'active' }, { where: { id } });
        res.status(200).json({ message: 'Anúncio aprovado.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.rejectAd = async (req, res) => {
    try {
        const { id } = req.params;
        const fs = require('fs');
        const path = require('path');
        const { AnuncioImage } = require('../models');

        // Delete images
        const adDir = path.join(__dirname, '../../public/imgs', String(id));
        if (fs.existsSync(adDir)) {
            fs.rmSync(adDir, { recursive: true, force: true });
        }
        await AnuncioImage.destroy({ where: { anuncio_id: id } });

        // Delete payments
        const { Payment } = require('../models');
        await Payment.destroy({ where: { anuncio_id: id } });

        // Delete Ad
        await Anuncio.destroy({ where: { id } });

        res.status(200).json({ message: 'Anúncio rejeitado e removido.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await Usuario.findAll({
            attributes: ['id', 'nome', 'email', 'isVerified', 'isBanned', 'createdAt', 'isAdmin'],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.toggleUserBan = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await Usuario.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isBanned = !user.isBanned;
        await user.save();

        res.status(200).json({ message: `Usuário ${user.isBanned ? 'banido' : 'desbanido'}`, isBanned: user.isBanned });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.populateLocations = async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const { State, City } = require('../models');

        req.setTimeout(300000); // 5 minutes

        // Load States
        const statesPath = path.join(__dirname, '../../database/estados.json');
        if (!fs.existsSync(statesPath)) return res.status(500).json({ error: 'estados.json não encontrado' });

        const statesData = JSON.parse(fs.readFileSync(statesPath, 'utf8'));
        const states = statesData.map(s => ({ id: s.id, name: s.nome, abbreviation: s.sigla }));

        // Upsert States and Cities
        await State.bulkCreate(states, { updateOnDuplicate: ['name', 'abbreviation'] });

        // Load Cities
        const citiesPath = path.join(__dirname, '../../database/municipios.json');
        if (!fs.existsSync(citiesPath)) return res.status(500).json({ error: 'municipios.json não encontrado' });

        const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
        const cities = citiesData.map(c => {
            if (!c.microrregiao?.mesorregiao?.UF?.id) return null;
            return { id: c.id, name: c.nome, state_id: c.microrregiao.mesorregiao.UF.id };
        }).filter(c => c !== null);

        // Chunking
        const chunkSize = 500;
        for (let i = 0; i < cities.length; i += chunkSize) {
            const chunk = cities.slice(i, i + chunkSize);
            await City.bulkCreate(chunk, { updateOnDuplicate: ['name', 'state_id'] });
        }

        res.status(200).json({ message: `Sucesso! ${states.length} estados e ${cities.length} cidades processados.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.verifyUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await Usuario.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.isVerified = true;
        user.activationToken = null; // Clear token
        await user.save();

        res.status(200).json({ message: 'Usuário verificado manualmente.', isVerified: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
