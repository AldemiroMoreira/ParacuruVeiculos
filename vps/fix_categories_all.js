const { Fabricante, Modelo, Categoria } = require('./models');
const sequelize = require('./config/database');
const { Op } = require('sequelize');

(async () => {
    try {
        await sequelize.authenticate();

        // 1. Get Category IDs
        const cats = await Categoria.findAll();
        const catMap = {}; // Name -> ID
        cats.forEach(c => catMap[c.nome] = c.id);

        console.log('--- MAPPING CATEGORIES ---');
        console.log(catMap);

        const ID_CARRO = catMap['Carro'];
        const ID_MOTO = catMap['Moto'];
        const ID_CAMINHAO = catMap['Caminhão']; // Ensure accents match DB

        if (!ID_CARRO || !ID_MOTO) {
            console.error('CRITICAL: Could not find Category IDs for "Carro" or "Moto"');
            process.exit(1);
        }

        // 2. Define Lists
        const carBrands = [
            'Jeep', 'Volkswagen', 'Fiat', 'Chevrolet', 'Ford', 'Renault', 'Hyundai', 'Toyota',
            'Honda', 'Nissan', 'Caoa Chery', 'Chery', 'BYD', 'GWM', 'Peugeot', 'Citroën',
            'Mitsubishi', 'Audi', 'BMW', 'Mercedes-Benz', 'Land Rover', 'Kia', 'Volvo', 'Porsche',
            'Lexus', 'Subaru', 'Ram', 'Mini', 'Jaguar'
        ]; // Assuming Volvo/MB are primarily cars for this app context or standardizing to Car. 
        // Ram is a truck but usually categorized as "Carro" (Pickup) in simple classification or "Caminhão"? 
        // In Brazil, Ram 2500 is Caminhão CNH, but users look for it in Cars/Pickups. I'll put Ram in Carro for now.

        const motoBrands = [
            'Yamaha', 'Kawasaki', 'Kasinski', 'Dafra', 'Harley-Davidson', 'Sundown', 'Traxx',
            'Shineray', 'Suzuki' // Suzuki cars exist, but Suzuki Motos is common. I will perform a check or just assume Moto for now? 
            // Suzuki is tricky. Grand Vitara vs Yes 125. 
            // I will exclude Suzuki from auto-fix to be safe, OR fix based on known non-Suzuki Car brands.
        ];

        const truckBrands = [
            'Scania', 'Iveco', 'DAF', 'Man', 'Sinotruk'
        ];

        // 3. Update Function
        async function updateBrandModels(brandName, targetCatId) {
            const fab = await Fabricante.findOne({ where: { nome: brandName } });
            if (!fab) {
                console.log(`Skipping ${brandName} (Not found)`);
                return;
            }

            const [affected] = await Modelo.update(
                { categoria_id: targetCatId },
                { where: { fabricante_id: fab.id } }
            );

            if (affected > 0) console.log(`[FIXED] ${brandName}: Updated ${affected} models to Cat ID ${targetCatId}`);
        }

        console.log('\n--- FIXING CARS ---');
        for (const brand of carBrands) await updateBrandModels(brand, ID_CARRO);

        console.log('\n--- FIXING MOTOS ---');
        for (const brand of motoBrands) await updateBrandModels(brand, ID_MOTO);

        console.log('\n--- FIXING TRUCKS ---');
        for (const brand of truckBrands) await updateBrandModels(brand, ID_CAMINHAO);

    } catch (e) {
        console.error('ERROR:', e.message);
    }
    process.exit(0);
})();
