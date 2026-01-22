const sequelize = require('./config/database');
const { Modelo, EspecieVeiculo, Fabricante } = require('./models');

// Data from seed_motos.js to identify motorcycles
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

const migrate = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        // 1. Add column if not exists
        try {
            await sequelize.query("ALTER TABLE modelos ADD COLUMN especie_id INTEGER");
            console.log("Added especie_id to modelos.");
        } catch (e) {
            console.log("Column especie_id might already exist.");
        }

        // 2. Get Especie IDs
        const auto = await EspecieVeiculo.findOne({ where: { nome: 'Automóvel' } });
        const moto = await EspecieVeiculo.findOne({ where: { nome: 'Moto' } });

        if (!auto || !moto) {
            console.error("Especies Automóvel or Moto not found.");
            return;
        }

        console.log(`Auto ID: ${auto.id}, Moto ID: ${moto.id}`);

        // 3. Update Motos
        // Flatten motos list
        const motoModelNames = [];
        motosData.forEach(d => {
            d.modelos.forEach(m => motoModelNames.push(m));
        });

        // Update all models that are in motoModelNames to have especie_id = moto.id
        // NOTE: Some manufacturers like BMW make both cars and motos. We rely on model name uniqueness or just update if name matches.

        // First, set ALL to Auto by default (since we started with cars)
        // Or better: Update where especie_id IS NULL to Auto (if we consider previous data was all cars)
        // But wait, we just added motos in previous step (seed_motos.js).
        // Let's just iterate and update.

        const allModelos = await Modelo.findAll();

        for (const mod of allModelos) {
            let tipo = auto.id; // Default to Car

            // Check if it is a moto
            if (motoModelNames.includes(mod.nome)) {
                tipo = moto.id;
            }

            // Special case for manufacturers that ONLY make motos or ONLY cars?
            // Not safe, BMW, Honda, Suzuki make both.
            // But 'Honda' in our seed_motos had specific models.
            // If the model name is exactly what we seeded for motos, it's a moto.

            await mod.update({ especie_id: tipo });
        }

        console.log("Updated modelos with especie_id.");
        process.exit(0);

    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrate();
