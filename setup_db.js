const mariadb = require('mariadb');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend/.env') });

async function setup() {
    try {
        const pool = mariadb.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            port: Number(process.env.DB_PORT),
            multipleStatements: true
        });

        const connection = await pool.getConnection();

        console.log('Connected to MariaDB/MySQL.');

        // Read Schema
        const schemaPath = path.join(__dirname, 'database/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Execute Schema
        // The schema includes CREATE DATABASE and USE.
        console.log('Executing schema...');
        await connection.query(schemaSql);

        console.log('Database setup complete.');
        await connection.end();

    } catch (error) {
        console.error('Setup Error:', error);
    }
}

setup();
