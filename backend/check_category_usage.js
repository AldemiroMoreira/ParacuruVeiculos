const { Categoria, Modelo, Anuncio } = require('./models');

async function checkUsage() {
    try {
        const cats = await Categoria.findAll();
        console.log('--- Uso de Categorias ---');
        for (const c of cats) {
            const modelCount = await Modelo.count({ where: { categoria_id: c.id } });
            const adCount = await Anuncio.count({ where: { categoria_id: c.id } });
            console.log(`[${c.id}] ${c.nome}: ${modelCount} modelos, ${adCount} anúncios`);
        }
        console.log('-------------------------');
    } catch (e) {
        console.error(e);
    }
}
checkUsage();
