const Propaganda = require('../models/Propaganda');
const sequelize = require('../config/database');

exports.getPropagandas = async (req, res) => {
    try {
        const { localizacao } = req.query;
        const where = { ativo: true };

        if (localizacao) {
            where.localizacao = localizacao;
        }

        const propagandas = await Propaganda.findAll({
            where,
            order: sequelize.random() // Randomize ads to give equal exposure
        });

        // Async update views count (fire and forget)
        propagandas.forEach(p => p.increment('views'));

        res.json(propagandas);
    } catch (error) {
        console.error('Erro ao buscar propagandas:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
};

exports.clickPropaganda = async (req, res) => {
    try {
        const { id } = req.params;
        const propaganda = await Propaganda.findByPk(id);

        if (propaganda) {
            await propaganda.increment('clicks');
            return res.status(200).json({ message: 'Click registrado', url: propaganda.link_destino });
        }
        res.status(404).json({ message: 'Propaganda não encontrada' });
    } catch (error) {
        console.error('Erro ao registrar click:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
};
