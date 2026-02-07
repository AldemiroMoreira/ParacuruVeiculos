const { Propaganda } = require('./backend/models');
const { Op } = require('sequelize');

async function check() {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const count = await Propaganda.count({
            where: {
                created_at: {
                    [Op.gte]: startOfDay
                }
            }
        });
        console.log('Ads created today:', count);
        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
