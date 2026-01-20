const { Propaganda } = require('../models');
const sequelize = require('../config/database');

exports.getAds = async (req, res) => {
    try {
        const { location } = req.query;
        const whereClause = { ativo: true };
        if (location) whereClause.localizacao = location;

        const ads = await Propaganda.findAll({
            where: whereClause,
            order: sequelize.random(), // Randomize ads
            limit: 5
        });

        // Increment views async
        ads.forEach(ad => ad.increment('views'));

        res.json(ads);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar propagandas' });
    }
};

exports.clickAd = async (req, res) => {
    try {
        const { id } = req.params;
        const ad = await Propaganda.findByPk(id);
        if (ad) {
            await ad.increment('clicks');
            return res.json({ success: true, url: ad.link_destino });
        }
        res.status(404).json({ error: 'Propaganda nao encontrada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao registrar clique' });
    }
};

// Simple Create for Admin (Future)
exports.createAd = async (req, res) => {
    try {
        const ad = await Propaganda.create(req.body);
        res.Status(201).json(ad);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar' });
    }
};
