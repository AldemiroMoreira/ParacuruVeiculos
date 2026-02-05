const { Propaganda } = require('../backend/models');

async function fixLocations() {
    try {
        console.log('Moving ads from home_middle to sidebar...');
        const [updated] = await Propaganda.update(
            { localizacao: 'sidebar' },
            { where: { localizacao: 'home_middle' } }
        );
        console.log(`Updated ${updated} ads.`);
    } catch (error) {
        console.error('Error updating locations:', error);
    }
}

fixLocations();
