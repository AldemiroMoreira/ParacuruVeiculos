const { Categoria, Fabricante } = require('./models');
const sequelize = require('./config/database');

(async () => {
    try {
        await sequelize.authenticate();

        console.log('--- CATEGORIAS ---');
        const cats = await Categoria.findAll();
        cats.forEach(c => console.log(`[${c.id}] ${c.nome}`));

        console.log('\n--- JEEP CHECK ---');
        const jeep = await Fabricante.findOne({ where: { nome: 'Jeep' } });
        if (jeep) console.log(`Jeep ID: ${jeep.id}`);

    } catch (e) {
        console.error(e.message);
    }
    process.exit(0);
})();
