const { Modelo, Categoria, Fabricante } = require('./models');
const { Op } = require('sequelize');

// Copy-pasted from seed_motos.js to ensure exact matching
const motosData = [
    { marca: 'Honda', modelos: ['CG 160 Titan', 'CG 160 Fan', 'CG 160 Start', 'Biz 125', 'Biz 110i', 'Pop 110i', 'NXR 160 Bros', 'XRE 300', 'XRE 190', 'CB 250F Twister', 'CB 300F Twister', 'CB 500F', 'CB 500X', 'NC 750X', 'Africa Twin 1100', 'CBR 1000RR', 'CB 1000R', 'PCX 150', 'PCX 160', 'Elite 125', 'ADV 150'] },
    { marca: 'Yamaha', modelos: ['Fazer 250 (FZ25)', 'Fazer 150', 'Factor 150', 'Factor 125', 'Crosser 150', 'Lander 250', 'MT-03', 'MT-07', 'MT-09', 'R3', 'R15', 'NMAX 160', 'XMAX 250', 'Fluo 125', 'Neo 125'] },
    { marca: 'Suzuki', modelos: ['GSX-S750', 'GSX-S1000', 'V-Strom 650', 'V-Strom 1050', 'Hayabusa', 'Burgman 400', 'GSX-R1000R'] },
    { marca: 'BMW', modelos: ['G 310 GS', 'G 310 R', 'F 750 GS', 'F 850 GS', 'F 900 R', 'R 1250 GS', 'S 1000 RR', 'R 18'] },
    { marca: 'Kawasaki', modelos: ['Ninja 300', 'Ninja 400', 'Ninja 650', 'Ninja ZX-6R', 'Ninja ZX-10R', 'Z400', 'Z650', 'Z900', 'Z1000', 'Versys-X 300', 'Versys 650', 'Versys 1000', 'Vulcan S'] },
    { marca: 'Harley-Davidson', modelos: ['Iron 883', 'Sportster S', 'Fat Boy 114', 'Heritage Classic', 'Road King Special', 'Street Glide Special', 'Pan America 1250'] },
    { marca: 'Triumph', modelos: ['Tiger 660 Sport', 'Tiger 900', 'Tiger 1200', 'Street Triple 765', 'Speed Twin', 'Bonneville T100', 'Bonneville T120', 'Scrambler 900', 'Rocket 3'] },
    { marca: 'Royal Enfield', modelos: ['Meteor 350', 'Classic 350', 'Hunter 350', 'Himalayan 411', 'Scram 411', 'Interceptor 650', 'Continental GT 650', 'Super Meteor 650'] },
    { marca: 'Dafra', modelos: ['Citycom 300 CBS', 'Citycom HD 300', 'Maxsym 400', 'Cruisym 150', 'Cruisym 300', 'Apache RTR 200', 'NH 190', 'NH 300'] },
    { marca: 'Shineray', modelos: ['XY 50 Q', 'Jet 50', 'Jet 125', 'Ray 50', 'Phoenix 50', 'SHI 175', 'JEF 150'] },
    { marca: 'Haojue', modelos: ['DK 150', 'DK 160', 'DR 160', 'Chopper Road 150', 'Master Ride 150', 'Lindy 125', 'VR 150', 'NK 150'] },
    { marca: 'Ducati', modelos: ['Panigale V4', 'Streetfighter V4', 'Monster', 'Diavel V4', 'Multistrada V4', 'Scrambler Icon'] }
];

async function fixMixedCategories() {
    try {
        console.log('Starting advanced category fix...');

        // 1. Ensure Categories Exist
        const extraCats = ['Barco', 'Aeronave'];
        for (const nm of extraCats) {
            await Categoria.findOrCreate({ where: { nome: nm } });
        }

        const car = await Categoria.findOne({ where: { nome: 'Carro' } });
        const moto = await Categoria.findOne({ where: { nome: 'Moto' } });

        console.log(`Carro ID: ${car.id}, Moto ID: ${moto.id}`);

        // 2. Reset Multi-Category Manufacturers (Honda, Yamaha, Suzuki, BMW) to 'Carro' first
        // This fixes my previous mistake where I set ALL Honda to Moto.
        // Actually, just reset ALL models to Carro as a baseline?
        // No, that's heavy. Let's just target the ones I messed up or all "Ambiguous" brands.
        // Or safer: Update ALL to Carro, then re-apply Moto based on the EXACT MODEL LIST.
        // This is robust.

        console.log('Resetting all models to "Carro"...');
        await Modelo.update({ categoria_id: car.id }, { where: {} });

        // 3. Apply "Moto" category to known moto models
        console.log('Applying "Moto" category to specific models...');

        let motoCount = 0;
        const allMotoNames = [];
        motosData.forEach(d => allMotoNames.push(...d.modelos));

        // Use efficient update with IN clause
        const res = await Modelo.update(
            { categoria_id: moto.id },
            { where: { nome: { [Op.in]: allMotoNames } } }
        );
        console.log(`Updated ${res[0]} models to "Moto" based on exact name match.`);

        console.log('Fix complete.');
        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

fixMixedCategories();
