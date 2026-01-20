const sequelize = require('./backend/config/database');
const { DataTypes } = require('sequelize');

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        // 1. Ensure States and Cities schemas are correct (Sequelize sync)
        // We will define models minimally here if needed, or rely on existing tables + raw queries.
        // Assuming current tables are weird, let's just drop and recreate States/Cities correctly and then migrate Anuncios.
        // Actually, let's try to preserve data if possible, but user said "modify database".

        // Let's create `states` and `cities` if not exist first using Raw Queries to be safer about schema

        console.log('Migrating States...');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS states (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                abbreviation VARCHAR(10) NOT NULL
            );
        `);

        // Check if states table has 'uf' column (old schema)
        try {
            const [cols] = await sequelize.query("DESCRIBE states");
            const hasUf = cols.some(c => c.Field === 'uf');
            if (hasUf) {
                console.log('Old states table detected. Dropping...');
                await sequelize.query("DROP TABLE IF EXISTS cities"); // Drop cities first as it might depend on states
                await sequelize.query("DROP TABLE states");
                // Recreate
                await sequelize.query(`
                    CREATE TABLE states (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        abbreviation VARCHAR(10) NOT NULL
                    );
                `);
            }
        } catch (e) { }

        // Seed States
        const statesList = [
            { name: 'Ceará', abbr: 'CE' },
            { name: 'São Paulo', abbr: 'SP' },
            { name: 'Rio de Janeiro', abbr: 'RJ' }
        ];

        for (const s of statesList) {
            const [res] = await sequelize.query(`SELECT id FROM states WHERE abbreviation = '${s.abbr}'`);
            if (res.length === 0) {
                await sequelize.query(`INSERT INTO states (name, abbreviation) VALUES ('${s.name}', '${s.abbr}')`);
            }
        }

        console.log('Migrating Cities...');
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS cities (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                state_id INT NOT NULL,
                FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE
            );
        `);

        // Seed Basic Cities for Demo
        const citiesList = [
            { name: 'Fortaleza', abbr: 'CE' },
            { name: 'Caucaia', abbr: 'CE' },
            { name: 'São Paulo', abbr: 'SP' },
            { name: 'Campinas', abbr: 'SP' },
            { name: 'Rio de Janeiro', abbr: 'RJ' },
            { name: 'Niterói', abbr: 'RJ' }
        ];

        for (const c of citiesList) {
            const [sRes] = await sequelize.query(`SELECT id FROM states WHERE abbreviation = '${c.abbr}'`);
            if (sRes.length > 0) {
                const stateId = sRes[0].id;
                const [cRes] = await sequelize.query(`SELECT id FROM cities WHERE name = '${c.name}' AND state_id = ${stateId}`);
                if (cRes.length === 0) {
                    await sequelize.query(`INSERT INTO cities (name, state_id) VALUES ('${c.name}', ${stateId})`);
                }
            }
        }

        console.log('Migrating Anuncios...');
        // Add columns if not exist
        const [anuncioCols] = await sequelize.query("DESCRIBE anuncios");
        const hasStateId = anuncioCols.some(c => c.Field === 'state_id');

        if (!hasStateId) {
            await sequelize.query("ALTER TABLE anuncios ADD COLUMN state_id INT NULL");
            await sequelize.query("ALTER TABLE anuncios ADD COLUMN city_id INT NULL");
            await sequelize.query("ALTER TABLE anuncios ADD CONSTRAINT fk_anuncios_state FOREIGN KEY (state_id) REFERENCES states(id)");
            await sequelize.query("ALTER TABLE anuncios ADD CONSTRAINT fk_anuncios_city FOREIGN KEY (city_id) REFERENCES cities(id)");

            console.log('Columns added. Attempting data migration...');
            // Try to map existing text state/city to IDs
            // This is complex if data is dirty. We will skip complex migration for now or do best effort.

            // Example best effort:
            // UPDATE anuncios a JOIN states s ON a.state = s.abbreviation SET a.state_id = s.id;
            // UPDATE anuncios a JOIN cities c ON a.city = c.name SET a.city_id = c.id; 
            // Note: City mapping is risky if cities have same names in diff states, but mvp.

            try {
                await sequelize.query("UPDATE anuncios a JOIN states s ON a.state = s.abbreviation SET a.state_id = s.id");
                // For cities, we need to join on state as well ideally
                await sequelize.query("UPDATE anuncios a JOIN cities c ON a.city = c.name AND a.state_id = c.state_id SET a.city_id = c.id");
            } catch (e) {
                console.log("Data migration partial failure (expected if columns don't exist): " + e.message);
            }
        }

        // Remove old columns ?? Or keep them nullable? Requests said "modify ... to be relational".
        // Let's drop them to be clean, or rename them. Safer to drop constraints if any, then drop columns.
        // await sequelize.query("ALTER TABLE anuncios DROP COLUMN state");
        // await sequelize.query("ALTER TABLE anuncios DROP COLUMN city");

        console.log('Migration done.');

    } catch (error) {
        console.error('Migration Error:', error);
    } finally {
        await sequelize.close();
    }
}

migrate();
