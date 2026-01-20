const sequelize = require('./backend/config/database');

async function check() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("SHOW TABLES;");
        console.log("TABLES:", results.map(r => Object.values(r)[0]));

        try {
            const [cols] = await sequelize.query("DESCRIBE estates;"); // typo check
        } catch (e) { }

        const [cols2] = await sequelize.query("DESCRIBE estados;");
        console.log("ESTADOS Columns:", cols2.map(c => c.Field));

    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}
check();
