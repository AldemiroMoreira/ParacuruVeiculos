const { Anuncio } = require('./models');
const { Op } = require('sequelize');

async function fixExpiration() {
    try {
        console.log('Searching for "Fale com o Suporte" ad...');

        // Find by ID 24 (from debug output) or Title
        const ad = await Anuncio.findOne({
            where: {
                [Op.or]: [
                    { id: 24 },
                    { titulo: 'Fale com o Suporte' }
                ]
            }
        });

        if (!ad) {
            console.log('Ad not found!');
            return;
        }

        console.log(`Found Ad: ${ad.titulo} (ID: ${ad.id})`);
        console.log(`Current Expires At: ${ad.expires_at}`);
        console.log(`Current Status: ${ad.status}`);

        // Set to 2030
        const newDate = new Date('2030-01-01T00:00:00Z');
        ad.expires_at = newDate;
        ad.status = 'active'; // Ensure it's active

        await ad.save();

        console.log('--------------------------------------------------');
        console.log(`Updated Expires At: ${ad.expires_at}`);
        console.log('Ad updated successfully.');

    } catch (error) {
        console.error('Error fixing expiration:', error);
    }
}

fixExpiration();
