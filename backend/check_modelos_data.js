const { Modelo, Categoria } = require('./models');

(async () => {
    try {
        const modelos = await Modelo.findAll({
            include: [Categoria],
            limit: 10
        });
        console.log(JSON.stringify(modelos, null, 2));

        const nullCats = await Modelo.count({ where: { categoria_id: null } });
        console.log(`Modelos sem categoria: ${nullCats}`);
    } catch (e) {
        console.error(e);
    }
})();
