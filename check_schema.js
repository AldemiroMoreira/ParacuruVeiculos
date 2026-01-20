const sequelize = require('./backend/config/database');
async function run() {
    try {
        await sequelize.authenticate();
        console.log('--- STATES TABLE ---');
        try {
            const [states] = await sequelize.query("DESCRIBE states;");
            console.log(JSON.stringify(states, null, 2));
        } catch (e) { console.log("states table error: " + e.message); }

        console.log('--- CITIES TABLE ---');
        try {
            const [cities] = await sequelize.query("DESCRIBE cities;");
            console.log(JSON.stringify(cities, null, 2));
        } catch (e) { console.log("cities table error: " + e.message); }

    } catch (e) { console.error("DB Connection Error: " + e); }
    process.exit();
}
run();
