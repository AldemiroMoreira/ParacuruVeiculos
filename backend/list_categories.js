const { Categoria } = require('./models');

(async () => {
    try {
        const cats = await Categoria.findAll();
        console.log('--- Database Categories ---');
        cats.forEach(c => console.log(`${c.id}: ${c.nome}`));
    } catch (e) {
        console.error(e);
    }
})();
