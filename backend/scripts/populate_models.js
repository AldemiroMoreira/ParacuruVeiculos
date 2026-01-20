const { sequelize, Fabricante, Modelo } = require('../models');

const fabricantesData = [
    {
        nome: 'Toyota',
        modelos: [
            'Hilux Cabine Dupla CD 2.8 TDI SRX 4WD (Aut)',
            'Hilux Cabine Dupla CD 2.8 TDI SRV 4WD (Aut)',
            'Hilux Cabine Simples CS 2.8 TDI 4WD',
            'Corolla Altis Premium 2.0 Flex',
            'Corolla XEi 2.0 Flex',
            'Corolla Cross XRX Hybrid 1.8',
            'Yaris Hatch XLS 1.5 Flex',
            'Yaris Sedan XLS 1.5 Flex',
            'SW4 SRX 2.8 TDI 4WD 7 Lugares'
        ]
    },
    {
        nome: 'Chevrolet',
        modelos: [
            'Onix Hatch Premier 1.0 Turbo',
            'Onix Plus Premier 1.0 Turbo',
            'Tracker Premier 1.2 Turbo',
            'S10 Cabine Dupla High Country 2.8 Turbo Diesel 4WD',
            'S10 Cabine Dupla LTZ 2.5 Flex 4WD',
            'Cruze Sedan Premier 1.4 Turbo',
            'Spin Activ 7 Lugares 1.8 Flex'
        ]
    },
    {
        nome: 'Volkswagen',
        modelos: [
            'Gol 1.0 MPI',
            'Voyage 1.6 MSI',
            'Polo Highline 200 TSI',
            'Virtus Highline 200 TSI',
            'Nivus Highline 200 TSI',
            'T-Cross Highline 250 TSI',
            'Taos Highline 250 TSI',
            'Amarok V6 Extreme 3.0 TDI 4WD',
            'Saveiro Cross CD 1.6 MSI'
        ]
    },
    {
        nome: 'Fiat',
        modelos: [
            'Strada Volcano 1.3 CD',
            'Strada Freedom 1.3 CS',
            'Toro Ranch 2.0 Turbo Diesel 4WD',
            'Toro Volcano 1.3 Turbo 270',
            'Pulse Impetus 1.0 Turbo 200',
            'Fastback Limited Edition 1.3 Turbo 270',
            'Argo HGT 1.8 Flex',
            'Cronos Precision 1.8 Flex',
            'Mobi Trekking 1.0'
        ]
    },
    {
        nome: 'Jeep',
        modelos: [
            'Renegade Trailhawk 1.3 Turbo 4WD',
            'Renegade Longitude 1.3 Turbo',
            'Compass Trailhawk 2.0 Turbo Diesel 4WD',
            'Compass S 1.3 Turbo 270',
            'Commander Overland 2.0 Turbo Diesel 4WD'
        ]
    },
    {
        nome: 'Hyundai',
        modelos: [
            'HB20 Diamond 1.0 Turbo',
            'HB20S Diamond 1.0 Turbo',
            'Creta Ultimate 2.0',
            'Creta N Line 1.0 Turbo'
        ]
    },
    {
        nome: 'Honda',
        modelos: [
            'City Touring 1.5',
            'City Hatchback Touring 1.5',
            'HR-V Touring 1.5 Turbo',
            'Civic Touring 1.5 Turbo'
        ]
    },
    {
        nome: 'Ford',
        modelos: [
            'Ranger Limited 3.2 Diesel 4WD',
            'Ranger Storm 3.2 Diesel 4WD',
            'Bronco Sport Wildtrak 2.0 Turbo 4WD',
            'Territory Titanium 1.5 Turbo',
            'Maverick Lariat FX4 2.0 Turbo AWD',
            'Mustang Mach 1 5.0 V8'
        ]
    },
    {
        nome: 'Renault',
        modelos: [
            'Kwid Outsider 1.0',
            'Sandero S Edition 1.0',
            'Logan Zen 1.6',
            'Duster Iconic 1.6 CVT',
            'Oroch Outsider 1.3 Turbo'
        ]
    },
    {
        nome: 'Nissan',
        modelos: [
            'Kicks Exclusive 1.6 CVT',
            'Versa Exclusive 1.6 CVT',
            'Frontier PRO-4X 2.3 Bi-Turbo Diesel 4WD'
        ]
    }
];

const populate = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Sync to ensure tables exist (optional if already managed)
        // await sequelize.sync(); 

        for (const fabData of fabricantesData) {
            // Find or Create Fabricante
            let [fabricante, created] = await Fabricante.findOrCreate({
                where: { nome: fabData.nome }
            });

            if (created) console.log(`Created Fabricante: ${fabData.nome}`);
            else console.log(`Found Fabricante: ${fabData.nome}`);

            for (const modeloNome of fabData.modelos) {
                const [modelo, modCreated] = await Modelo.findOrCreate({
                    where: {
                        nome: modeloNome,
                        fabricante_id: fabricante.id
                    }
                });
                if (modCreated) console.log(`  + Created Modelo: ${modeloNome}`);
            }
        }

        console.log('Populate finished!');
        process.exit(0);
    } catch (error) {
        console.error('Error populating:', error);
        process.exit(1);
    }
};

populate();
