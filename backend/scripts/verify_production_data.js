const sequelize = require('../config/database');
const State = require('../models/State');
const City = require('../models/City');

const verifyData = async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected.');

        console.log('--- States Verification ---');
        const stateCount = await State.count();
        console.log(`Total States: ${stateCount}`);

        if (stateCount > 0) {
            const firstState = await State.findOne();
            console.log('First State sample:', JSON.stringify(firstState.toJSON(), null, 2));
        }

        console.log('\n--- Cities Verification ---');
        const cityCount = await City.count();
        console.log(`Total Cities: ${cityCount}`);

        if (cityCount > 0) {
            const firstCity = await City.findOne();
            console.log('First City sample:', JSON.stringify(firstCity.toJSON(), null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
};

verifyData();
