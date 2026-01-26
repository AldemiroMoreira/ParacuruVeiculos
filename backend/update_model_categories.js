const { Modelo, Categoria, Fabricante } = require('./models');
const { Op } = require('sequelize');

async function updateCategories() {
    try {
        console.log('Starting category update...');

        // 1. Get Categories
        const car = await Categoria.findOne({ where: { nome: 'Carro' } });
        const moto = await Categoria.findOne({ where: { nome: 'Moto' } });

        if (!car || !moto) {
            console.error('Categories Carro or Moto not found!');
            return;
        }

        console.log(`Carro ID: ${car.id}, Moto ID: ${moto.id}`);

        // 2. Define lists
        // Pure Moto Manufacturers
        const motoFabNames = ['Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'Harley-Davidson', 'Triumph', 'Royal Enfield', 'Dafra', 'Shineray', 'Haojue', 'Ducati'];

        // Mixed logic or specific models
        const motoModels = [
            // BMW Motos typically start with G, F, S, K, R followed by numbers, but cars use Series.
            // Let's list specific BMW moto models if any in our DB?
            // From modelos.json: 'G 310 GS', 'F 850 GS', etc.
        ];

        // 3. Update by Manufacturer
        const motoFabs = await Fabricante.findAll({ where: { nome: { [Op.in]: motoFabNames } } });
        const motoFabIds = motoFabs.map(f => f.id);

        if (motoFabIds.length > 0) {
            const res = await Modelo.update({ categoria_id: moto.id }, { where: { fabricante_id: { [Op.in]: motoFabIds } } });
            console.log(`Updated ${res[0]} models from Moto manufacturers to Category 'Moto'.`);
        }

        // 4. Update specific models (if manufacturers are mixed like BMW)
        // Check BMW models
        // BMW ID?
        const bmw = await Fabricante.findOne({ where: { nome: 'BMW' } });
        if (bmw) {
            // Fetch all BMW models
            const bmwModels = await Modelo.findAll({ where: { fabricante_id: bmw.id } });
            for (const m of bmwModels) {
                // Heuristic: BMW cars are 'Series 3', 'X1', 'iX'. Motos 'GS', 'RR', 'K'.
                // If model name contains "GS", "RR", "R ", "F ", "G ", "K ", it's likely a moto.
                // Simple list from seed_motos check.
                if (m.nome.includes('GS') || m.nome.includes('RR') || m.nome.startsWith('R ') || m.nome.startsWith('K ') || m.nome.startsWith('F ') || m.nome.startsWith('G ')) {
                    await m.update({ categoria_id: moto.id });
                    console.log(`Updated BMW model ${m.nome} to Moto.`);
                } else {
                    // Default to car
                    await m.update({ categoria_id: car.id });
                }
            }
        }

        // 5. Ensure everything else is Car (if null) or just force update valid Cars?
        // Let's assume non-motoFabs are cars for now (Toyota, Chevrolet, etc)
        // Update where categoria_id is NOT Moto (to correct distincts) OR null

        // Easier: Set all to Car WHERE manufacturer NOT IN motoFabIds AND NOT BMW
        const excludeIds = [...motoFabIds];
        if (bmw) excludeIds.push(bmw.id);

        const resCar = await Modelo.update(
            { categoria_id: car.id },
            { where: { fabricante_id: { [Op.notIn]: excludeIds } } }
        );
        console.log(`Updated ${resCar[0]} models to Category 'Carro'.`);

        console.log('Update complete.');
        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

updateCategories();
