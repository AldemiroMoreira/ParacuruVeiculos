const { Fabricante } = require('./models');
const sequelize = require('./config/database');

const logos = {
    'Honda': 'https://logo.clearbit.com/honda.com.br',
    'Toyota': 'https://logo.clearbit.com/toyota.com.br',
    'Chevrolet': 'https://logo.clearbit.com/chevrolet.com.br',
    'Volkswagen': 'https://logo.clearbit.com/vw.com.br',
    'Fiat': 'https://logo.clearbit.com/fiat.com.br',
    'Ford': 'https://logo.clearbit.com/ford.com.br',
    'Hyundai': 'https://logo.clearbit.com/hyundai.com.br',
    'Renault': 'https://logo.clearbit.com/renault.com.br',
    'Nissan': 'https://logo.clearbit.com/nissan.com.br',
    'Jeep': 'https://logo.clearbit.com/jeep.com.br',
    'BMW': 'https://logo.clearbit.com/bmw.com.br',
    'Yamaha': 'https://logo.clearbit.com/yamaha-motor.com.br',
    'Suzuki': 'https://logo.clearbit.com/suzukimotos.com.br', // specialized for motos
    'Kawasaki': 'https://logo.clearbit.com/kawasakibrasil.com',
    'Harley-Davidson': 'https://logo.clearbit.com/harley-davidson.com',
    'Triumph': 'https://logo.clearbit.com/triumphmotorcycles.com.br',
    'Royal Enfield': 'https://logo.clearbit.com/royalenfield.com',
    'BYD': 'https://logo.clearbit.com/byd.com.br', // This should fix BYD
    'GWM': 'https://logo.clearbit.com/gwmmotors.com.br',
    'Chery': 'https://logo.clearbit.com/caoachery.com.br', // Caoa Chery uses this domain
    'CAOA Chery': 'https://logo.clearbit.com/caoachery.com.br',
    'Audi': 'https://logo.clearbit.com/audi.com.br',
    'Citroën': 'https://logo.clearbit.com/citroen.com.br',
    'Dafra': 'https://www.daframotos.com.br/assets/img/logo-dafra.png', // Direct from official site if clearbit fails
    'Carro': '', // Categories don't need logos here
    'Moto': ''
};

const populate = async () => {
    try {
        await sequelize.authenticate();

        // Ensure column exists using raw query for safety
        try {
            await sequelize.query("ALTER TABLE fabricantes ADD COLUMN logo_url VARCHAR(255)");
            console.log("Column 'logo_url' added.");
        } catch (e) {
            console.log("Column 'logo_url' likely already exists or other error (ignored):", e.message);
        }

        console.log('Database schema checked.');

        for (const [name, url] of Object.entries(logos)) {
            const fab = await Fabricante.findOne({ where: { nome: name } });
            if (fab) {
                await fab.update({ logo_url: url });
                console.log(`Updated logo for ${name}`);
            }
        }

        console.log('Done.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

populate();
