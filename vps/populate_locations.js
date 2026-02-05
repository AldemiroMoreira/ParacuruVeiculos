const fs = require('fs');
const path = require('path');
const { sequelize, State, City } = require('./models');

async function seedLocations() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');

        // 1. Sync tables (force: true to clear checking for empty tables first? 
        // Audit said 0 records, so force:true is safe and ensures clean slate)
        // However, be careful if other tables depend on them.
        // Anuncio depends on State/City. If I drop State/City, Anuncios might break or cascade delete?
        // Let's NOT use force:true if tables exist, just truncate or upsert.
        // But since they are empty, upsert is fine.

        // Let's use bulkCreate with updateOnDuplicate or ignoreDuplicates.

        // Load States
        // Expecting json files in ./data/ relative to this script on VPS
        const statesPath = path.join(__dirname, 'data/estados.json');
        console.log(`Loading states from ${statesPath}`);
        const statesData = JSON.parse(fs.readFileSync(statesPath, 'utf8'));

        const states = statesData.map(s => ({
            abbreviation: s.sigla, // PK
            name: s.nome
        }));

        console.log(`Upserting ${states.length} states...`);
        await State.bulkCreate(states, { updateOnDuplicate: ['name'] });
        console.log('States populated.');

        // Load Cities
        const citiesPath = path.join(__dirname, 'data/municipios.json');
        console.log(`Loading cities from ${citiesPath}`);
        const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));

        const cities = [];
        let skipped = 0;

        for (const c of citiesData) {
            let uf = null;
            // Traverse nested structure
            if (c.microrregiao && c.microrregiao.mesorregiao && c.microrregiao.mesorregiao.UF) {
                uf = c.microrregiao.mesorregiao.UF.sigla;
            } else if (c['regiao-imediata'] && c['regiao-imediata']['regiao-intermediaria'] && c['regiao-imediata']['regiao-intermediaria'].UF) {
                uf = c['regiao-imediata']['regiao-intermediaria'].UF.sigla;
            }

            if (uf) {
                cities.push({
                    id: c.id, // Keep ID from IBGE
                    nome: c.nome,
                    uf: uf // Foreign key -> State.abbreviation
                });
            } else {
                skipped++;
            }
        }

        console.log(`Prepared ${cities.length} cities. Skipped ${skipped}.`);

        // Insert in chunks
        const chunkSize = 500;
        for (let i = 0; i < cities.length; i += chunkSize) {
            const chunk = cities.slice(i, i + chunkSize);
            await City.bulkCreate(chunk, { ignoreDuplicates: true }); // Ignore if exists
            if (i % 5000 === 0) console.log(`Inserted ${i} / ${cities.length}`);
        }

        console.log('Cities populated successfully.');

    } catch (error) {
        console.error('Error seeding locations:', error);
    } finally {
        await sequelize.close();
    }
}

seedLocations();
