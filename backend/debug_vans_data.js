const { Fabricante, Modelo, Categoria } = require('./models');

(async () => {
    try {
        // 1. Check Category
        const vanCat = await Categoria.findOne({ where: { nome: 'Vans/Utilitários' } });
        if (!vanCat) {
            console.error('Category "Vans/Utilitários" NOT FOUND!');
        } else {
            console.log(`Category "Vans/Utilitários" found with ID: ${vanCat.id}`);
        }

        // 2. Check Models in this Category
        if (vanCat) {
            const models = await Modelo.findAll({
                where: { categoria_id: vanCat.id },
                include: [Fabricante]
            });
            console.log(`Found ${models.length} models in this category.`);
            models.forEach(m => {
                console.log(` - Model: ${m.nome}, Manufacturer: ${m.Fabricante ? m.Fabricante.nome : 'NULL'}`);
            });
        }

        // 3. Test Controller Logic Simulation
        if (vanCat) {
            const fabs = await Fabricante.findAll({
                include: [{
                    model: Modelo,
                    where: { categoria_id: vanCat.id },
                    required: true
                }]
            });
            console.log('--- Manufacturers returned by Controller Logic ---');
            fabs.forEach(f => console.log(f.nome));
        }

    } catch (e) {
        console.error(e);
    }
})();
