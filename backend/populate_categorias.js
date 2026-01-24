const sequelize = require('./config/database');
const { Categoria, Modelo, EspecieVeiculo } = require('./models');

const populate = async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected.');

        // 1. Ensure Categorias exist
        console.log('Populating Categorias...');
        const categories = ['Carro', 'Moto', 'Caminhão', 'Van/Utilitário', 'Outros'];
        const catMap = {};

        for (const nome of categories) {
            try {
                // Use defaults to be safe, though nome is unique usually
                const [cat] = await Categoria.findOrCreate({
                    where: { nome },
                    defaults: { nome }
                });
                catMap[nome] = cat.id;
            } catch (err) {
                console.error(`Error creating category ${nome}:`, err.message);
            }
        }
        console.log('Categories synced:', catMap);

        // 2. Update Modelos
        let especies = [];
        try {
            especies = await EspecieVeiculo.findAll();
        } catch (e) {
            console.warn('Could not fetch EspecieVeiculo, table might be missing or empty. Proceeding without species mapping.', e.message);
        }

        const espMap = {}; // id -> name
        especies.forEach(e => espMap[e.id] = e.nome);

        console.log('Especies found:', espMap);

        const modelos = await Modelo.findAll();
        console.log(`Processing ${modelos.length} models...`);

        let updatedCount = 0;

        for (const mod of modelos) {
            let catId = catMap['Outros']; // Default

            // Try to deduce from especie_id
            if (mod.especie_id && espMap[mod.especie_id]) {
                const espName = espMap[mod.especie_id];
                if (espName === 'Automóvel') catId = catMap['Carro'];
                else if (espName === 'Moto') catId = catMap['Moto'];
                else if (espName === 'Caminhão') catId = catMap['Caminhão'];
                else if (espName === 'Ônibus') catId = catMap['Outros'];
                else if (espName === 'Barco') catId = catMap['Outros'];
                else if (espName === 'Aeronave') catId = catMap['Outros'];
            }

            // Fallback for safety
            if (!catId && catMap['Carro']) catId = catMap['Carro'];

            if (catId && mod.categoria_id !== catId) {
                await mod.update({ categoria_id: catId });
                updatedCount++;
            }
        }

        console.log(`Updated ${updatedCount} models with new categoria_id.`);
        console.log('Done.');
        process.exit(0);

    } catch (error) {
        console.error('Fatal Error:', error);
        process.exit(1);
    }
};

populate();
