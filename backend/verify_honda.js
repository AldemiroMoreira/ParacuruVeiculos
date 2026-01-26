const { Modelo, Categoria, Fabricante } = require('./models');

async function verify() {
    try {
        const honda = await Fabricante.findOne({ where: { nome: 'Honda' } });
        if (!honda) {
            console.log('Honda factory not found');
            return;
        }

        console.log('--- Honda Models ---');
        const models = await Modelo.findAll({
            where: { fabricante_id: honda.id },
            include: [Categoria]
        });

        models.forEach(m => {
            console.log(`${m.nome} -> ${m.Categorium ? m.Categorium.nome : 'NULL'}`);
        });

        console.log('\n--- All Categories ---');
        const cats = await Categoria.findAll();
        cats.forEach(c => console.log(c.nome));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
verify();
