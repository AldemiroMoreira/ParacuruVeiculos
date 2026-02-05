const sequelize = require('./backend/config/database');

async function checkTables() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');
        const rawResult = await sequelize.query("SHOW TABLES");
        console.log('Raw Result:', rawResult);
        const [results] = rawResult;
        if (!results) {
            console.log('No results found.');
            return;
        }
        console.log('Tables:', results.map(r => Object.values(r)[0]));

        // Check columns of anuncios
        const [columns] = await sequelize.query("DESCRIBE anuncios");
        console.log('Anuncios Columns:', columns.map(c => c.Field));

        // Check columns of states
        try {
            const [stCols] = await sequelize.query("DESCRIBE states");
            console.log('States Columns:', stCols.map(c => c.Field));
        } catch (e) { console.log("States table might not exist"); }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkTables();
