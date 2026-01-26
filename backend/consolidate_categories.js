const { Categoria, Modelo, Anuncio } = require('./models');

async function consolidate() {
    try {
        console.log('Starting consolidation...');

        // 1. Find Categories
        const auto = await Categoria.findOne({ where: { nome: 'Automóvel' } });
        const carro = await Categoria.findOne({ where: { nome: 'Carro' } });

        if (!auto) {
            console.log("Category 'Automóvel' not found. Nothing to consolidate.");
            process.exit(0);
        }

        if (!carro) {
            // Rename Automóvel to Carro if Carro doesn't exist?
            console.log("Category 'Carro' not found. Renaming 'Automóvel' to 'Carro'...");
            await auto.update({ nome: 'Carro' });
            console.log("Renamed successfully.");
            process.exit(0);
        }

        console.log(`Consolidating 'Automóvel' (ID: ${auto.id}) into 'Carro' (ID: ${carro.id})...`);

        // 2. Update Models
        const modRes = await Modelo.update(
            { categoria_id: carro.id },
            { where: { categoria_id: auto.id } }
        );
        console.log(`Updated ${modRes[0]} models.`);

        // 3. Update Anuncios
        const adRes = await Anuncio.update(
            { categoria_id: carro.id },
            { where: { categoria_id: auto.id } }
        );
        console.log(`Updated ${adRes[0]} ads.`);

        // 4. Delete Automóvel
        await auto.destroy();
        console.log("Deleted 'Automóvel' category.");

        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

consolidate();
