const mariadb = require('mariadb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function listTables() {
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

        const rows = await connection.query("SHOW TABLES");
        console.log("Tables in database:", rows);
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) await connection.end();
        process.exit(0);
    }
}
listTables();
