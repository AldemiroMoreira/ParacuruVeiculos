const { Fabricante, Modelo } = require('../models');

exports.getFabricantes = async (req, res) => {
    try {
        const fabricantes = await Fabricante.findAll({ order: [['nome', 'ASC']] });
        res.json(fabricantes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getModelos = async (req, res) => {
    try {
        const { fabricanteId } = req.params;
        const modelos = await Modelo.findAll({
            where: { fabricante_id: fabricanteId },
            order: [['nome', 'ASC']]
        });
        res.json(modelos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
