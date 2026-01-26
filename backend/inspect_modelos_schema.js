const { Sequelize } = require('sequelize');
require('dotenv').config();

// Config from environment or hardcoded fallback if .env is missing/not loaded correctly in this context
// Assuming standard MariaDB/MySQL setup
const sequelize = require('./config/database');

async function inspectTable() {
    console.log(`\n--- Inspecting Table: modelos ---\n`);

    try {
        await sequelize.authenticate();
        console.log('✅ Connection established.');

        const [results] = await sequelize.query("DESCRIBE modelos;");
        console.table(results);

        const hasCategoria = results.some(r => r.Field === 'categoria_id');
        if (hasCategoria) {
            console.log('✅ Column "categoria_id" EXISTS.');
        } else {
            console.error('❌ Column "categoria_id" is MISSING!');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

inspectTable();
