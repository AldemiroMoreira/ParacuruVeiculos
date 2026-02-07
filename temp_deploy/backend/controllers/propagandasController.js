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

// Admin CRUD
exports.createPropaganda = async (req, res) => {
    try {
        const data = req.body;
        if (req.file) {
            data.imagem_url = '/img/ads/' + req.file.filename;
        }

        const ad = await Propaganda.create(data);
        res.status(201).json(ad);
    } catch (error) {
        console.error('Erro ao criar propaganda:', error);
        res.status(500).json({ error: 'Erro ao criar propaganda' });
    }
};

exports.updatePropaganda = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        if (req.file) {
            data.imagem_url = '/img/ads/' + req.file.filename;
        }

        const [updated] = await Propaganda.update(data, { where: { id } });
        if (updated) {
            const updatedAd = await Propaganda.findByPk(id);
            return res.json(updatedAd);
        }
        res.status(404).json({ error: 'Propaganda não encontrada' });
    } catch (error) {
        console.error('Erro ao atualizar propaganda:', error);
        res.status(500).json({ error: 'Erro ao atualizar propaganda' });
    }
};

exports.deletePropaganda = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Propaganda.destroy({ where: { id } });
        if (deleted) {
            return res.status(204).send();
        }
        res.status(404).json({ error: 'Propaganda não encontrada' });
    } catch (error) {
        console.error('Erro ao deletar propaganda:', error);
        res.status(500).json({ error: 'Erro ao deletar propaganda' });
    }
};

exports.exportLinks = async (req, res) => {
    try {
        const ads = await Propaganda.findAll({ order: [['id', 'ASC']] });
        const links = ads.map(a => a.link_destino).join('\n');
        res.header('Content-Type', 'text/plain');
        res.send(links);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.importLinks = async (req, res) => {
    try {
        const { links } = req.body;
        if (!links) return res.status(400).json({ error: 'No links provided' });

        const linkArray = links.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const ads = await Propaganda.findAll({ order: [['id', 'ASC']] });

        let updatedCount = 0;
        for (let i = 0; i < ads.length; i++) {
            if (i < linkArray.length) {
                await ads[i].update({ link_destino: linkArray[i] });
                updatedCount++;
            }
        }
        res.json({ message: `Atualizados ${updatedCount} links com sucesso.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllPropagandas = async (req, res) => {
    try {
        const propagandas = await Propaganda.findAll({
            order: [['id', 'DESC']]
        });
        res.json(propagandas);
    } catch (error) {
        console.error('Erro ao buscar todas propagandas:', error);
        res.status(500).json({ error: 'Erro interno' });
    }
};
