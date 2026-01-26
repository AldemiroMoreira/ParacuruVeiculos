const { Fabricante, Modelo, Categoria } = require('./models');
const sequelize = require('./config/database');

const vansData = [
    {
        marca: 'Mercedes-Benz',
        modelos: ['Sprinter', 'Vito']
    },
    {
        marca: 'Fiat',
        modelos: ['Ducato', 'Fiorino', 'Scudo', 'Doblò Cargo']
    },
    {
        marca: 'Renault',
        modelos: ['Master', 'Kangoo']
    },
    {
        marca: 'Ford',
        modelos: ['Transit', 'Transit Custom', 'Transit Courier']
    },
    {
        marca: 'Peugeot',
        modelos: ['Boxer', 'Expert', 'Partner']
    },
    {
        marca: 'Citroën',
        modelos: ['Jumper', 'Jumpy', 'Berlingo']
    },
    {
        marca: 'Iveco',
        modelos: ['Daily']
    },
    {
        marca: 'Volkswagen',
        modelos: ['Kombi', 'Transporter']
    },
    {
        marca: 'Hyundai',
        modelos: ['HR']
    },
    {
        marca: 'Kia',
        modelos: ['Bongo']
    }
];

const seedVans = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Create Category
        // Using "Vans/Utilitários" as requested (vans.utilitarios implies a combined cat)
        const [vanCat] = await Categoria.findOrCreate({ where: { nome: 'Vans/Utilitários' } });
        console.log(`Categoria '${vanCat.nome}' ensured (ID: ${vanCat.id}).`);

        // 2. Process Data
        for (const data of vansData) {
            // Ensure Manufacturer
            const [fab] = await Fabricante.findOrCreate({
                where: { nome: data.marca },
                defaults: { nome: data.marca }
            });

            for (const modeloNome of data.modelos) {
                // Check if exists
                const [modelo, created] = await Modelo.findOrCreate({
                    where: { nome: modeloNome, fabricante_id: fab.id },
                    defaults: {
                        nome: modeloNome,
                        fabricante_id: fab.id,
                        categoria_id: vanCat.id
                    }
                });

                if (created) {
                    console.log(`Created model ${modeloNome} in Vans.`);
                } else {
                    // Start moving existing models to this new category if they were Cars
                    if (modelo.categoria_id !== vanCat.id) {
                        await modelo.update({ categoria_id: vanCat.id });
                        console.log(`Moved model ${modeloNome} to Vans category.`);
                    } else {
                        console.log(`Model ${modeloNome} already in Vans.`);
                    }
                }
            }
        }

        console.log('Seeding Vans complete.');
        process.exit(0);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seedVans();
