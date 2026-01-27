const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { sequelize, Categoria, Plano, Fabricante, Modelo, Usuario, State, City } = require('./models');

// Data Paths
const DATA_DIR = path.join(__dirname, '../database');

const readJson = (file) => {
    try {
        const p = path.join(DATA_DIR, file);
        if (!fs.existsSync(p)) return [];
        return JSON.parse(fs.readFileSync(p, 'utf-8'));
    } catch (e) {
        console.error(`Error reading ${file}:`, e);
        return [];
    }
};

async function seedEverything() {
    try {
        console.log('!!! WARNING: STARTING FULL DATABASE RESET !!!');
        console.log('Connecting to database...');
        await sequelize.authenticate();

        console.log('Dropping and re-creating schema (Force Sync)...');
        await sequelize.sync({ force: true });
        console.log('Schema created.');

        // 1. Categories
        console.log('Seeding Categories...');
        const cats = readJson('categorias.json');
        if (cats.length > 0) {
            await Categoria.bulkCreate(cats);
        } else {
            console.warn('No categories found to seed.');
        }

        // 2. Plans
        console.log('Seeding Plans...');
        const plans = readJson('planos.json');
        if (plans.length > 0) {
            await Plano.bulkCreate(plans);
        } else {
            console.warn('No plans found to seed.');
        }

        // 3. Manufacturers
        console.log('Seeding Manufacturers...');
        const fabs = readJson('fabricantes.json');
        if (fabs.length > 0) {
            await Fabricante.bulkCreate(fabs);
        } else {
            console.warn('No manufacturers found to seed.');
        }

        // 4. Models
        console.log('Seeding Models...');
        const mods = readJson('modelos.json');
        if (mods.length > 0) {
            await Modelo.bulkCreate(mods);
        } else {
            console.warn('No models found to seed.');
        }

        // 5. States
        console.log('Seeding States...');
        const rawStates = readJson('estados.json');
        if (rawStates.length > 0) {
            const states = rawStates.map(s => ({
                name: s.nome,
                abbreviation: s.sigla
            }));
            await State.bulkCreate(states);
        } else {
            console.warn('No states found to seed.');
        }

        // 6. Cities
        console.log('Seeding Cities...');
        const rawCities = readJson('municipios.json');
        if (rawCities.length > 0) {
            const cities = rawCities.map(m => ({
                id: m.id,
                nome: m.nome,
                uf: m.microrregiao?.mesorregiao?.UF?.sigla
            })).filter(c => c.uf); // valid UF only

            // Chunking
            const CHUNK_SIZE = 1000;
            for (let i = 0; i < cities.length; i += CHUNK_SIZE) {
                const chunk = cities.slice(i, i + CHUNK_SIZE);
                await City.bulkCreate(chunk);
                console.log(`Seeded cities ${i} to ${i + chunk.length}`);
            }
        } else {
            console.warn('No cities found to seed.');
        }

        // 7. Admin User
        console.log('Creating Admin User...');
        const email = 'aldemiro.moreira@gmail.com';
        const hashedPassword = await bcrypt.hash('admin', 10);
        await Usuario.create({
            nome: 'Aldemiro',
            email: email,
            password_hash: hashedPassword,
            telefone: '00000000000',
            isAdmin: true
        });

        console.log('!!! FULL RESET COMPLETE !!!');
        console.log('All data has been restored from local JSON dumps.');

        if (require.main === module) process.exit(0);

    } catch (e) {
        console.error('CRITICAL ERROR DURING SEED:', e);
        if (require.main === module) process.exit(1);
        throw e;
    }
}

if (require.main === module) {
    seedEverything();
}

module.exports = { seedEverything };
