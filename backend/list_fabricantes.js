const { Fabricante } = require('./models');

(async () => {
    try {
        const fabs = await Fabricante.findAll({ order: [['nome', 'ASC']] });
        console.log('--- Current Manufacturers ---');
        fabs.forEach(f => console.log(f.nome));
        console.log(`Total: ${fabs.length}`);
    } catch (e) {
        console.error(e);
    }
})();
