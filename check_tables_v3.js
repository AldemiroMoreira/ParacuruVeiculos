const sequelize = require('./backend/config/database');

async function checkTables() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');
        const [results] = await sequelize.query("SHOW TABLES;");
        console.log('Tables:', results.map(row => Object.values(row)[0]));
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}
checkTables();
