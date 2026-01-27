const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { sequelize, Categoria, Plano, Fabricante, Modelo, Usuario } = require('./models');

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
            // Bulk create is efficient
            await Modelo.bulkCreate(mods);
        } else {
            console.warn('No models found to seed.');
        }

        // 5. Admin User
        console.log('Creating Admin User...');
        const email = 'aldemiro.moreira@gmail.com';
        const hashedPassword = await bcrypt.hash('admin', 10);
        await Usuario.create({
            nome: 'Aldemiro',
            email: email,
            password_hash: hashedPassword,
            telefone: '00000000000', // Default dummy
            isAdmin: true // Ensure logic supports this if field exists, otherwise email check is used
        });

        console.log('!!! FULL RESET COMPLETE !!!');
        console.log('All data has been restored from local JSON dumps.');

        // If run directly
        if (require.main === module) process.exit(0);

    } catch (e) {
        console.error('CRITICAL ERROR DURING SEED:', e);
        if (require.main === module) process.exit(1);
        throw e; // Re-throw for API handling
    }
}

if (require.main === module) {
    seedEverything();
}

module.exports = { seedEverything };
