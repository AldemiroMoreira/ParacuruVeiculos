const fs = require('fs');
const path = require('path');
const mariadb = require('mariadb');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

async function seedCities() {
    let connection;
    try {
        console.log('Reading municipios.json...');
        const jsonPath = path.join(__dirname, 'municipios.json');
        const rawData = fs.readFileSync(jsonPath, 'utf8');
        const municipios = JSON.parse(rawData);

        console.log(`Found ${municipios.length} municipalities.`);

        console.log('Connecting to database...');
        const pool = mariadb.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            port: Number(process.env.DB_PORT),
            database: process.env.DB_NAME // explicitly connect to db
        });

        connection = await pool.getConnection();

        // Ensure database is selected if DB_NAME not in env or if pool doesn't auto-select
        // But usually providing database option is enough.
        // Let's assume the schema.sql created the DB.
        // If DB_NAME is missing from env, we might default to 'paracuru_db' based on schema.sql?
        // Safe check:
        const dbName = process.env.DB_NAME || 'paracuru_db';
        await connection.query(`USE ${dbName};`);

        console.log('Preparing data...');
        const values = municipios.map(m => {
            const id = m.id;
            const nome = m.nome;
            // Extract UF from nested structure: microrregiao -> mesorregiao -> UF -> sigla
            // Some JSONs might vary slightly, but assuming consistent structure based on sample.
            // Using optional chaining to be safe.
            const uf = m.microrregiao?.mesorregiao?.UF?.sigla;
            return [id, nome, uf];
        }).filter(v => v[2]); // Ensure UF exists

        console.log(`Prepared ${values.length} valid entries.`);

        // Batch insert
        const BATCH_SIZE = 1000;
        for (let i = 0; i < values.length; i += BATCH_SIZE) {
            const batch = values.slice(i, i + BATCH_SIZE);
            
            // Construct query manually for bulk insert
            // (mariadb driver supports batch with batch() method but manual construction is often more visible/controllable for simple inserts)
            // Actually driver's batch() is for prepared statements reused.
            // For simple bulk insert: INSERT INTO cities (id, nome, uf) VALUES (?,?,?), (?,?,?)...

            // Creating placeholders is tricky.
            // Let's use connection.batch() which executes a prepared statement multiple times for parameters.
            // It is efficient.
            
            const result = await connection.batch(
                "INSERT INTO cities (id, nome, uf) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE nome=VALUES(nome), uf=VALUES(uf)",
                batch
            );
            console.log(`Inserted batch ${i} to ${i + batch.length}: Affected rows: ${result.affectedRows}`);
        }

        console.log('Cities seeding completed successfully.');

    } catch (err) {
        console.error('Error seeding cities:', err);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}

seedCities();
