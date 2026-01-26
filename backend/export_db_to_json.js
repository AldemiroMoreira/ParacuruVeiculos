const fs = require('fs');
const path = require('path');
const { Fabricante, Modelo } = require('./models');

(async () => {
    try {
        console.log('Exporting data...');

        // 1. Fabricantes
        const fabs = await Fabricante.findAll({ order: [['id', 'ASC']] });
        const fabsData = fabs.map(f => ({ id: f.id, nome: f.nome }));
        fs.writeFileSync(path.join(__dirname, '../database/fabricantes.json'), JSON.stringify(fabsData, null, 4));
        console.log(`Exported ${fabs.length} manufacturers.`);

        // 2. Modelos
        const mods = await Modelo.findAll({ order: [['id', 'ASC']] });
        const modsData = mods.map(m => ({
            id: m.id,
            fabricante_id: m.fabricante_id,
            nome: m.nome,
            categoria_id: m.categoria_id // We should preserve category_id!
        }));

        // Note: seed_prod.js currently assumes all models in json are Carros (line 36-44 of seed_prod.js).
        // WE MUST FIX THAT LOGIC in seed_prod.js TO USE THE EXPORTED CATEGORY_ID if present.

        fs.writeFileSync(path.join(__dirname, '../database/modelos.json'), JSON.stringify(modsData, null, 4));
        console.log(`Exported ${mods.length} models.`);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
