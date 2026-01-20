const sequelize = require('./backend/config/database');
const { DataTypes } = require('sequelize');

// Define simplified definitions for migration
const State = sequelize.define('State', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    abbreviation: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'states', timestamps: false });

const City = sequelize.define('City', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    state_id: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'cities', timestamps: false });

async function migrate() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        // 1. Force Sync States and Cities (Create table if not exist)
        // Adjusting schema by explicitly creating tables if needed via sync
        await State.sync(); // Creates if not exists
        await City.sync();

        // 2. Seed States
        const statesList = [
            { name: 'Ceará', abbreviation: 'CE' },
            { name: 'São Paulo', abbreviation: 'SP' },
            { name: 'Rio de Janeiro', abbreviation: 'RJ' }
        ];

        for (const s of statesList) {
            await State.findOrCreate({
                where: { abbreviation: s.abbreviation },
                defaults: s
            });
        }

        // 3. Seed Cities
        const citiesList = [
            { name: 'Fortaleza', abbr: 'CE' },
            { name: 'Caucaia', abbr: 'CE' },
            { name: 'São Paulo', abbr: 'SP' },
            { name: 'Campinas', abbr: 'SP' },
            { name: 'Rio de Janeiro', abbr: 'RJ' },
            { name: 'Niterói', abbr: 'RJ' }
        ];

        for (const c of citiesList) {
            const state = await State.findOne({ where: { abbreviation: c.abbr } });
            if (state) {
                await City.findOrCreate({
                    where: { name: c.name, state_id: state.id },
                    defaults: { name: c.name, state_id: state.id }
                });
            }
        }

        // 4. Alter Anuncios Table
        // Use raw query for ALTER as Sequelize doesn't support easy ALTER via models
        console.log('Migrating Anuncios Schema...');
        try {
            // Check if column exists by trying to select it limit 0 (or just ignore error)
            // Better: always try to add, catch error
            await sequelize.query("ALTER TABLE anuncios ADD COLUMN state_id INT NULL");
            await sequelize.query("ALTER TABLE anuncios ADD COLUMN city_id INT NULL");

            // Add FKs
            // Note: Constraints might fail if table isn't clean or types mismatch. 
            // We assume 'anuncios' exists.
            try {
                await sequelize.query("ALTER TABLE anuncios ADD CONSTRAINT fk_anuncios_state FOREIGN KEY (state_id) REFERENCES states(id)");
                await sequelize.query("ALTER TABLE anuncios ADD CONSTRAINT fk_anuncios_city FOREIGN KEY (city_id) REFERENCES cities(id)");
            } catch (e) { console.log('FK constraints might already exist or failed: ' + e.message); }

            // Migrate Data
            // UPDATE with joins
            await sequelize.query(`
                UPDATE anuncios a 
                JOIN states s ON a.state = s.abbreviation 
                SET a.state_id = s.id 
                WHERE a.state_id IS NULL
             `);

            // City migration is trickier without state link in old data, but old data has state string.
            await sequelize.query(`
                UPDATE anuncios a 
                JOIN cities c ON a.city = c.name 
                JOIN states s ON c.state_id = s.id AND a.state = s.abbreviation
                SET a.city_id = c.id
                WHERE a.city_id IS NULL
             `);

        } catch (e) {
            console.log("Schema alteraion partial error (maybe columns exist): " + e.message);
        }

        console.log('Migration complete.');

    } catch (error) {
        console.error('Migration Error:', error);
    } finally {
        await sequelize.close();
    }
}

migrate();
