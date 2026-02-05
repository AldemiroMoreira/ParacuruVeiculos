const { Fabricante, Modelo, Categoria } = require('./models');
const sequelize = require('./config/database');

(async () => {
    try {
        await sequelize.authenticate();

        // 1. Find Manufacturer "Jeep"
        const jeep = await Fabricante.findOne({ where: { nome: 'Jeep' } });

        if (!jeep) {
            console.log('>>> Manufacturer "Jeep" NOT FOUND in DB');
            process.exit(1);
        }

        console.log(`>>> Found Jeep (ID: ${jeep.id})`);

        // 2. Find Models for Jeep
        const models = await Modelo.findAll({ where: { fabricante_id: jeep.id } });

        console.log(`>>> Found ${models.length} models for Jeep:`);
        models.forEach(m => console.log(`   - [${m.id}] ${m.nome} (Cat ID: ${m.categoria_id})`));

        // 3. Check Categories
        const cats = await Categoria.findAll();
        console.log('>>> Categories:');
        cats.forEach(c => console.log(`   - [${c.id}] ${c.nome}`));

    } catch (e) {
        console.error('ERROR:', e.message);
    }
    process.exit(0);
})();
