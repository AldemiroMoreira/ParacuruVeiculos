const fs = require('fs');
const path = require('path');
const { sequelize, State, City } = require('./models');

async function seedLocations() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');

        // Sync models to ensure tables exist
        await City.drop(); // Ensure no child table
        await State.sync({ force: true }); // Reset states
        await City.sync({ force: true });  // Reset cities
        console.log('Tables synced.');

        // Load States
        const statesPath = path.join(__dirname, '../database/estados.json');
        const statesData = JSON.parse(fs.readFileSync(statesPath, 'utf8'));

        console.log(`Loading states from ${statesPath}`);
        const states = statesData.map(s => ({
            id: s.id,
            name: s.nome,
            abbreviation: s.sigla
        }));
        console.log(`Prepared ${states.length} states. First:`, states[0]);

        await State.bulkCreate(states);
        console.log(`${states.length} states inserted.`);

        // Load Cities
        const citiesPath = path.join(__dirname, '../database/municipios.json');
        console.log(`Loading cities from ${citiesPath}`);
        const citiesData = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));
        console.log(`Loaded ${citiesData.length} raw city records.`);

        const cities = citiesData.map((c, index) => {
            try {
                // Traverse nested structure to find state ID
                // Structure: c.microrregiao.mesorregiao.UF.id
                if (!c.microrregiao || !c.microrregiao.mesorregiao || !c.microrregiao.mesorregiao.UF) {
                    console.warn(`Skipping city at index ${index} (id: ${c.id}) due to missing structure.`);
                    return null;
                }
                const stateId = c.microrregiao.mesorregiao.UF.id;
                return {
                    id: c.id,
                    name: c.nome,
                    state_id: stateId
                };
            } catch (err) {
                console.error(`Error mapping city at index ${index}:`, err);
                return null;
            }
        }).filter(c => c !== null);

        console.log(`Prepared ${cities.length} valid cities for insertion.`);

        // Insert in chunks to avoid overwhelming the database
        const chunkSize = 100;
        for (let i = 0; i < cities.length; i += chunkSize) {
            const chunk = cities.slice(i, i + chunkSize);
            try {
                await City.bulkCreate(chunk);
                console.log(`Inserted cities chunk ${i} to ${i + chunk.length}`);
            } catch (chunkError) {
                console.error(`Error inserting chunk starting at ${i}:`, chunkError.message);
                // Optionally throw to stop or continue
                throw chunkError;
            }
        }

        console.log(`${cities.length} cities inserted successfully.`);

    } catch (error) {
        console.error('Error seeding locations:', error);
    } finally {
        await sequelize.close();
    }
}

seedLocations();
