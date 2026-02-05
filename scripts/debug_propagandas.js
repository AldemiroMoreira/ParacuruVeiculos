const { Propaganda } = require('../backend/models');

async function checkAds() {
    try {
        console.log('Checking Propaganda table...');
        const count = await Propaganda.count();
        console.log(`Total Ads: ${count}`);

        if (count > 0) {
            const ads = await Propaganda.findAll({
                attributes: ['id', 'titulo', 'localizacao', 'link_destino']
            });
            console.log(JSON.stringify(ads, null, 2));
        }
    } catch (error) {
        console.error('Error checking ads:', error);
    }
}

checkAds();
