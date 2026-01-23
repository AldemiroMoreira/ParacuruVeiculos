const { Fabricante, Modelo, Categoria, Plano } = require('../models');

exports.getPlanos = async (req, res) => {
    try {
        const planos = await Plano.findAll({ order: [['preco', 'ASC']] });
        res.json(planos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

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
        const { categoriaId } = req.query;

        let where = { fabricante_id: fabricanteId };
        if (categoriaId) {
            where.categoria_id = categoriaId;
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

exports.getCategorias = async (req, res) => {
    try {
        const categorias = await Categoria.findAll({ order: [['nome', 'ASC']] });
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
