const fs = require('fs');
const path = require('path');
const { Fabricante, Modelo, Categoria, Plano } = require('./models');

(async () => {
    try {
        console.log('Exporting data...');

        const dataDir = path.join(__dirname, '../database');
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

        // 1. Categorias
        const cats = await Categoria.findAll({ order: [['id', 'ASC']] });
        fs.writeFileSync(path.join(dataDir, 'categorias.json'), JSON.stringify(cats, null, 4));
        console.log(`Exported ${cats.length} categories.`);

        // 2. Planos
        const plans = await Plano.findAll({ order: [['id', 'ASC']] });
        fs.writeFileSync(path.join(dataDir, 'planos.json'), JSON.stringify(plans, null, 4));
        console.log(`Exported ${plans.length} plans.`);

        // 3. Fabricantes
        const fabs = await Fabricante.findAll({ order: [['id', 'ASC']] });
        const fabsData = fabs.map(f => ({ id: f.id, nome: f.nome, logo_url: f.logo_url }));
        fs.writeFileSync(path.join(dataDir, 'fabricantes.json'), JSON.stringify(fabsData, null, 4));
        console.log(`Exported ${fabs.length} manufacturers.`);

        // 4. Modelos
        const mods = await Modelo.findAll({ order: [['id', 'ASC']] });
        const modsData = mods.map(m => ({
            id: m.id,
            fabricante_id: m.fabricante_id,
            nome: m.nome,
            categoria_id: m.categoria_id
        }));

        fs.writeFileSync(path.join(dataDir, 'modelos.json'), JSON.stringify(modsData, null, 4));
        console.log(`Exported ${mods.length} models.`);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
