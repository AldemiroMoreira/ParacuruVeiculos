const sequelize = require('./backend/config/database');

async function check() {
    try {
        await sequelize.authenticate();
        console.log("Connected.");
        // Use raw query to check columns
        const [results] = await sequelize.query("SHOW COLUMNS FROM states;");
        // Print only field names
        console.log("Columns in 'states':", results.map(r => r.Field));
    } catch (e) {
        console.log("Error:", e.message);
    } finally {
        await sequelize.close();
    }
}
check();
