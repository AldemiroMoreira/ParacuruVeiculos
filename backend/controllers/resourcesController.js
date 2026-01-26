const { Fabricante, Modelo, Categoria, Plano } = require('../models');
const { runSeed } = require('../services/seeder');

exports.syncDatabase = async (req, res) => {
    try {
        const result = await runSeed();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

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
        const { categoriaId } = req.query;
        let where = {};

        // If Category ID is provided, we need to filter manufacturers that have models in this category
        // This requires a more complex query (semi-join) or simple logic if your DB is small.
        // Easiest is to include Model with where clause.
        let include = [];
        if (categoriaId) {
            include = [{
                model: Modelo,
                where: { categoria_id: categoriaId },
                attributes: [], // We don't need model data, just presence
                required: true // Inner join
            }];
        }

        const fabricantes = await Fabricante.findAll({
            where,
            include,
            order: [['nome', 'ASC']]
        });
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
        const categorias = await Categoria.findAll({ order: [['id', 'ASC']] });
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.populateCategories = async (req, res) => {
    try {
        const { Categoria, Modelo, EspecieVeiculo } = require('../models');

        // 1. Ensure Categorias exist
        const categories = ['Carro', 'Moto', 'Caminhão', 'Van/Utilitário', 'Outros'];
        const catMap = {};

        for (const nome of categories) {
            try {
                const [cat] = await Categoria.findOrCreate({
                    where: { nome },
                    defaults: { nome }
                });
                catMap[nome] = cat.id;
            } catch (err) {
                console.error(`Error creating category ${nome}:`, err.message);
            }
        }

        // 2. Update Modelos
        let especies = [];
        try {
            especies = await EspecieVeiculo.findAll();
        } catch (e) {
            console.warn('Could not fetch EspecieVeiculo');
        }

        const espMap = {};
        especies.forEach(e => espMap[e.id] = e.nome);

        const modelos = await Modelo.findAll();
        let updatedCount = 0;

        for (const mod of modelos) {
            let catId = catMap['Outros'];

            if (mod.especie_id && espMap[mod.especie_id]) {
                const espName = espMap[mod.especie_id];
                if (espName === 'Automóvel') catId = catMap['Carro'];
                else if (espName === 'Moto') catId = catMap['Moto'];
                else if (espName === 'Caminhão') catId = catMap['Caminhão'];
                else if (espName === 'Ônibus') catId = catMap['Outros'];
                else if (espName === 'Barco') catId = catMap['Outros'];
                else if (espName === 'Aeronave') catId = catMap['Outros'];
            }

            // Fallback
            if (!catId && catMap['Carro']) catId = catMap['Carro'];

            if (catId && mod.categoria_id !== catId) {
                await mod.update({ categoria_id: catId });
                updatedCount++;
            }
        }

        res.json({
            message: 'Categories populated and models updated successfully',
            categories: Object.keys(catMap),
            modelsUpdated: updatedCount
        });

    } catch (error) {
        res.status(500).json({ error: error.message, stack: error.stack });
    }
};
