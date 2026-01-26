const { Fabricante, Modelo, Categoria } = require('./models');
const sequelize = require('./config/database');

const cars = [
    {
        name: 'Ram',
        models: ['Rampage', '1500', '2500', '3500', 'Classic', 'Dakota']
    },
    {
        name: 'Porsche',
        models: ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', '718 Boxster', '718 Cayman']
    },
    {
        name: 'Mini',
        models: ['Cooper', 'Countryman', 'Clubman', 'Cooper SE', 'John Cooper Works']
    },
    {
        name: 'Subaru',
        models: ['Forester', 'Outback', 'Impreza', 'WRX', 'XV', 'Crosstrek']
    },
    {
        name: 'Lexus',
        models: ['NX', 'RX', 'UX', 'ES', 'LS', 'F-Sport']
    },
    {
        name: 'Jaguar',
        models: ['F-Pace', 'E-Pace', 'I-Pace', 'F-Type', 'XE', 'XF']
    },
    {
        name: 'Mitsubishi', // Existing, but adding models
        models: ['L200 Triton', 'Pajero Sport', 'Pajero Full', 'Pajero TR4', 'Outlander', 'Eclipse Cross', 'ASX', 'Lancer']
    },
    {
        name: 'Lada',
        models: ['Niva', 'Laika', 'Samara']
    },
    {
        name: 'Iveco',
        models: ['Daily']
    },
    {
        name: 'Volvo', // Just in case models are missing
        models: ['XC40', 'XC60', 'XC90', 'C40', 'S60', 'S90', 'V60']
    },
    {
        name: 'Land Rover',
        models: ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Evoque', 'Range Rover Sport', 'Range Rover Velar']
    }
];

const motos = [
    {
        name: 'Bajaj',
        models: ['Dominar 400', 'Dominar 200', 'Dominar 160', 'Pulsar']
    },
    {
        name: 'Avelloz',
        models: ['AZ1']
    },
    {
        name: 'Zontes',
        models: ['R310', 'V310', 'T310', 'GK350']
    }
];

const seedNewBrands = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Get Categories
        let [carroCat] = await Categoria.findOrCreate({ where: { nome: 'Carro' } });
        let [motoCat] = await Categoria.findOrCreate({ where: { nome: 'Moto' } });

        // Process Cars
        console.log('--- Processing Cars ---');
        for (const data of cars) {
            let [fab] = await Fabricante.findOrCreate({
                where: { nome: data.name },
                defaults: { nome: data.name }
            });
            console.log(`Fabricante: ${data.name}`);

            for (const modelName of data.models) {
                await Modelo.findOrCreate({
                    where: { nome: modelName, fabricante_id: fab.id },
                    defaults: {
                        nome: modelName,
                        fabricante_id: fab.id,
                        categoria_id: carroCat.id
                    }
                });
                // Ensure correct category if it exists
                await Modelo.update(
                    { categoria_id: carroCat.id },
                    { where: { nome: modelName, fabricante_id: fab.id } }
                );
            }
        }

        // Process Motos
        console.log('--- Processing Motos ---');
        for (const data of motos) {
            let [fab] = await Fabricante.findOrCreate({
                where: { nome: data.name },
                defaults: { nome: data.name }
            });
            console.log(`Fabricante: ${data.name}`);

            for (const modelName of data.models) {
                await Modelo.findOrCreate({
                    where: { nome: modelName, fabricante_id: fab.id },
                    defaults: {
                        nome: modelName,
                        fabricante_id: fab.id,
                        categoria_id: motoCat.id
                    }
                });
                // Ensure correct category
                await Modelo.update(
                    { categoria_id: motoCat.id },
                    { where: { nome: modelName, fabricante_id: fab.id } }
                );
            }
        }

        console.log('Seeding complete.');
        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seedNewBrands();
