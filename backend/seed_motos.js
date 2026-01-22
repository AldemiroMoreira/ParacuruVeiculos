const { Fabricante, Modelo } = require('./models');
const sequelize = require('./config/database');

const motosData = [
    {
        marca: 'Honda',
        modelos: ['CG 160 Titan', 'CG 160 Fan', 'CG 160 Start', 'Biz 125', 'Biz 110i', 'Pop 110i', 'NXR 160 Bros', 'XRE 300', 'XRE 190', 'CB 250F Twister', 'CB 300F Twister', 'CB 500F', 'CB 500X', 'NC 750X', 'Africa Twin 1100', 'CBR 1000RR', 'CB 1000R', 'PCX 150', 'PCX 160', 'Elite 125', 'ADV 150']
    },
    {
        marca: 'Yamaha',
        modelos: ['Fazer 250 (FZ25)', 'Fazer 150', 'Factor 150', 'Factor 125', 'Crosser 150', 'Lander 250', 'MT-03', 'MT-07', 'MT-09', 'R3', 'R15', 'NMAX 160', 'XMAX 250', 'Fluo 125', 'Neo 125']
    },
    {
        marca: 'Suzuki',
        modelos: ['GSX-S750', 'GSX-S1000', 'V-Strom 650', 'V-Strom 1050', 'Hayabusa', 'Burgman 400', 'GSX-R1000R']
    },
    {
        marca: 'BMW',
        modelos: ['G 310 GS', 'G 310 R', 'F 750 GS', 'F 850 GS', 'F 900 R', 'R 1250 GS', 'S 1000 RR', 'R 18']
    },
    {
        marca: 'Kawasaki',
        modelos: ['Ninja 300', 'Ninja 400', 'Ninja 650', 'Ninja ZX-6R', 'Ninja ZX-10R', 'Z400', 'Z650', 'Z900', 'Z1000', 'Versys-X 300', 'Versys 650', 'Versys 1000', 'Vulcan S']
    },
    {
        marca: 'Harley-Davidson',
        modelos: ['Iron 883', 'Sportster S', 'Fat Boy 114', 'Heritage Classic', 'Road King Special', 'Street Glide Special', 'Pan America 1250']
    },
    {
        marca: 'Triumph',
        modelos: ['Tiger 660 Sport', 'Tiger 900', 'Tiger 1200', 'Street Triple 765', 'Speed Twin', 'Bonneville T100', 'Bonneville T120', 'Scrambler 900', 'Rocket 3']
    },
    {
        marca: 'Royal Enfield',
        modelos: ['Meteor 350', 'Classic 350', 'Hunter 350', 'Himalayan 411', 'Scram 411', 'Interceptor 650', 'Continental GT 650', 'Super Meteor 650']
    },
    {
        marca: 'Dafra',
        modelos: ['Citycom 300 CBS', 'Citycom HD 300', 'Maxsym 400', 'Cruisym 150', 'Cruisym 300', 'Apache RTR 200', 'NH 190', 'NH 300']
    },
    {
        marca: 'Shineray',
        modelos: ['XY 50 Q', 'Jet 50', 'Jet 125', 'Ray 50', 'Phoenix 50', 'SHI 175', 'JEF 150']
    },
    {
        marca: 'Haojue',
        modelos: ['DK 150', 'DK 160', 'DR 160', 'Chopper Road 150', 'Master Ride 150', 'Lindy 125', 'VR 150', 'NK 150']
    },
    {
        marca: 'Ducati',
        modelos: ['Panigale V4', 'Streetfighter V4', 'Monster', 'Diavel V4', 'Multistrada V4', 'Scrambler Icon']
    }
];

const seedMotos = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        for (const data of motosData) {
            // Find or Create Fabricante
            let [fabricante] = await Fabricante.findOrCreate({
                where: { nome: data.marca },
                defaults: { nome: data.marca }
            });

            console.log(`Processing ${data.marca} (ID: ${fabricante.id})...`);

            // Add Modelos
            for (const modeloNome of data.modelos) {
                await Modelo.findOrCreate({
                    where: {
                        nome: modeloNome,
                        fabricante_id: fabricante.id
                    },
                    defaults: {
                        nome: modeloNome,
                        fabricante_id: fabricante.id
                    }
                });
            }
            console.log(`  Added/Verified ${data.modelos.length} models for ${data.marca}`);
        }

        console.log('Seeding motos completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding motos:', error);
        process.exit(1);
    }
};

seedMotos();
