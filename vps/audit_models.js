const { Fabricante, Modelo, Categoria } = require('./models');
const sequelize = require('./config/database');

(async () => {
    try {
        await sequelize.authenticate();

        console.log('--- CATEGORIAS ---');
        const cats = await Categoria.findAll({ raw: true });
        const catMap = {};
        cats.forEach(c => {
            console.log(`[ID: ${c.id}] ${c.nome}`);
            catMap[c.id] = c.nome;
        });

        console.log('\n--- AUDITORIA DE MODELOS POR FABRICANTE ---');
        const fabs = await Fabricante.findAll({
            include: [{ model: Modelo }],
            order: [['nome', 'ASC']]
        });

        for (const f of fabs) {
            // Group models by category
            const counts = {};
            f.Modelos.forEach(m => {
                const cName = catMap[m.categoria_id] || `Unknown(${m.categoria_id})`;
                counts[cName] = (counts[cName] || 0) + 1;
            });

            const summary = Object.entries(counts)
                .map(([cat, count]) => `${cat}: ${count}`)
                .join(', ');

            if (f.Modelos.length > 0) {
                console.log(`> ${f.nome}: ${summary}`);
            } else {
                // console.log(`> ${f.nome}: SEM MODELOS`);
            }
        }

    } catch (e) {
        console.error('ERROR:', e.message);
    }
    process.exit(0);
})();
