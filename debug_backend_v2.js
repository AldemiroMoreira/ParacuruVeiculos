const { State, City, sequelize } = require('./backend/models');

async function debug() {
    try {
        await sequelize.authenticate();
        console.log("DB Connected.");

        console.log("--- FINDING STATES ---");
        try {
            // This mirrors the controller: locationsController.getStates
            const states = await State.findAll({
                order: [['name', 'ASC']]
            });
            console.log(`Success! Found ${states.length} states.`);
            console.log("First state:", JSON.stringify(states[0], null, 2));
        } catch (e) {
            console.error("State.findAll failed:", e);
        }

    } catch (e) {
        console.error("Main Error:", e);
    } finally {
        await sequelize.close();
    }
}

debug();
