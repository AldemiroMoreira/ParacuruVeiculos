const mariadb = require('mariadb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function checkCounts() {
    let connection;
    try {
        const pool = mariadb.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            port: Number(process.env.DB_PORT),
            database: process.env.DB_NAME || 'paracuru_db'
        });
        connection = await pool.getConnection();

        const tables = ['cities', 'states', 'fabricantes', 'modelos'];
        for (const t of tables) {
            const res = await connection.query(`SELECT COUNT(*) as count FROM ${t}`);
            console.log(`${t}: ${res[0].count}`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}
checkCounts();
