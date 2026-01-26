const { Categoria, Modelo } = require('./models');

(async () => {
    try {
        const cat4 = await Categoria.findByPk(4);
        const cat10 = await Categoria.findByPk(10);

        if (!cat4 || !cat10) {
            console.log('One of the categories (4 or 10) does not exist.');
            // Try by name if IDs are different in this env though unlikely given the log
            // But let's be robust
            const target = await Categoria.findOne({ where: { nome: 'Van/Utilitário' } }); // Keep this
            const source = await Categoria.findOne({ where: { nome: 'Vans/Utilitários' } }); // Remove this

            if (target && source) {
                console.log(`Migrating models from ${source.nome} (${source.id}) to ${target.nome} (${target.id})...`);
                await Modelo.update({ categoria_id: target.id }, { where: { categoria_id: source.id } });
                console.log('Models updated.');
                await source.destroy();
                console.log('Source category deleted.');
            } else {
                console.log('Could not find both categories by name.');
            }
        } else {
            console.log(`Migrating models from ${cat10.nome} (${cat10.id}) to ${cat4.nome} (${cat4.id})...`);
            await Modelo.update({ categoria_id: cat4.id }, { where: { categoria_id: cat10.id } });
            console.log('Models updated.');
            await cat10.destroy();
            console.log('Source category deleted.');
        }

    } catch (e) {
        console.error(e);
    }
})();
