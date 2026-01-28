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
