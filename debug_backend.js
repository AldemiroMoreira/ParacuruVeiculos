const { State, City, Anuncio, sequelize } = require('./backend/models');

async function debug() {
    try {
        await sequelize.authenticate();
        console.log("DB Connected.");

        console.log("--- FINDING STATES ---");
        try {
            const states = await State.findAll({ limit: 2 });
            console.log("States found:", JSON.stringify(states, null, 2));
        } catch (e) {
            console.error("State.findAll failed:", e.message);
        }

        console.log("--- FINDING ANUNCIOS ---");
        try {
            const ads = await Anuncio.findAll({
                include: [
                    { model: State, attributes: ['name', 'abbreviation'] }
                ],
                limit: 1
            });
            console.log("Anuncios found:", JSON.stringify(ads, null, 2));
        } catch (e) {
            console.error("Anuncio.findAll failed:", e.message);
            // Log full error for deeper inspection
            console.error(e);
        }

    } catch (e) {
        console.error("Main Error:", e);
    } finally {
        await sequelize.close();
    }
}

debug();
