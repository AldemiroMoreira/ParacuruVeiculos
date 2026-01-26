const { Fabricante, Modelo, Categoria } = require('./models');
const sequelize = require('./config/database');

const trucks = [
    {
        marca: 'Scania',
        modelos: ['R 450', 'R 540', 'G 360', 'P 310', 'S 500']
    },
    {
        marca: 'Volvo', // Exists
        modelos: ['FH 540', 'FH 460', 'VM 270', 'VM 330', 'FMX']
    },
    {
        marca: 'Mercedes-Benz', // Exists
        modelos: ['Actros', 'Atego', 'Accelo', 'Axor']
    },
    {
        marca: 'DAF',
        modelos: ['XF 105', 'XF FTS', 'CF 85']
    },
    {
        marca: 'Volkswagen', // Exists
        modelos: ['Constellation', 'Delivery', 'Meteor', 'Worker']
    },
    {
        marca: 'Iveco', // Exists
        modelos: ['S-Way', 'Tector', 'Stralis', 'Eurocargo']
    }
];

const boats = [
    {
        marca: 'Fibrafort',
        modelos: ['Focker 160', 'Focker 210', 'Focker 240', 'Focker 272']
    },
    {
        marca: 'Schaefer_Yachts',
        modelos: ['Phantom 303', 'Schaefer 510', 'Schaefer 660']
    },
    {
        marca: 'Sea-Doo',
        modelos: ['GTI 130', 'RXP-X 300', 'GTX 170', 'Spark']
    },
    {
        marca: 'Bayliner',
        modelos: ['160 Bowrider', 'Element E16', 'VR5']
    }
];

const aircraft = [
    {
        marca: 'Embraer',
        modelos: ['Phenom 100', 'Phenom 300', 'Ipanema', 'Praetor 600']
    },
    {
        marca: 'Cessna',
        modelos: ['172 Skyhawk', '182 Skylane', '208 Caravan', 'Citation Jet']
    },
    {
        marca: 'Piper',
        modelos: ['Seneca', 'Archer', 'Cherokee', 'Malibu']
    },
    {
        marca: 'Robinson',
        modelos: ['R22', 'R44', 'R66 Turbine']
    }
];

const seedHeavy = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const [truckCat] = await Categoria.findOrCreate({ where: { nome: 'Caminhão' } });
        const [boatCat] = await Categoria.findOrCreate({ where: { nome: 'Barco' } });
        const [airCat] = await Categoria.findOrCreate({ where: { nome: 'Aeronave' } });

        // Trucks
        console.log('--- Seeding Trucks ---');
        for (const data of trucks) {
            const [fab] = await Fabricante.findOrCreate({ where: { nome: data.marca }, defaults: { nome: data.marca } });
            for (const mod of data.modelos) {
                await Modelo.findOrCreate({
                    where: { nome: mod, fabricante_id: fab.id },
                    defaults: { nome: mod, fabricante_id: fab.id, categoria_id: truckCat.id }
                });
                await Modelo.update({ categoria_id: truckCat.id }, { where: { nome: mod, fabricante_id: fab.id } });
            }
        }

        // Boats
        console.log('--- Seeding Boats ---');
        for (const data of boats) {
            // Check formatted name
            const brandName = data.marca.replace('_', ' ');
            const [fab] = await Fabricante.findOrCreate({ where: { nome: brandName }, defaults: { nome: brandName } });
            for (const mod of data.modelos) {
                await Modelo.findOrCreate({
                    where: { nome: mod, fabricante_id: fab.id },
                    defaults: { nome: mod, fabricante_id: fab.id, categoria_id: boatCat.id }
                });
                await Modelo.update({ categoria_id: boatCat.id }, { where: { nome: mod, fabricante_id: fab.id } });
            }
        }

        // Aircraft
        console.log('--- Seeding Aircraft ---');
        for (const data of aircraft) {
            const [fab] = await Fabricante.findOrCreate({ where: { nome: data.marca }, defaults: { nome: data.marca } });
            for (const mod of data.modelos) {
                await Modelo.findOrCreate({
                    where: { nome: mod, fabricante_id: fab.id },
                    defaults: { nome: mod, fabricante_id: fab.id, categoria_id: airCat.id }
                });
                await Modelo.update({ categoria_id: airCat.id }, { where: { nome: mod, fabricante_id: fab.id } });
            }
        }

        console.log('Seeding heavy/others complete.');
        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seedHeavy();
