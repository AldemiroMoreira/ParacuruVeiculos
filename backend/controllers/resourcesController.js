const { Fabricante, Modelo, EspecieVeiculo } = require('../models');

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
        const { especieId } = req.query;

        let where = { fabricante_id: fabricanteId };
        if (especieId) {
            where.especie_id = especieId;
        }

        const modelos = await Modelo.findAll({
            where,
            order: [['nome', 'ASC']]
        });
        res.json(modelos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getEspecies = async (req, res) => {
    try {
        const especies = await EspecieVeiculo.findAll({ order: [['nome', 'ASC']] });
        res.json(especies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
