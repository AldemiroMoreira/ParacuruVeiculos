const { Sequelize } = require('sequelize');
const config = require('../backend/config/database');
const { Anuncio, AnuncioImage } = require('../backend/models');
const fs = require('fs');
const path = require('path');

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: false
});

async function clearAds() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Delete all images from DB
        console.log('Deleting images from DB...');
        await AnuncioImage.destroy({ where: {}, truncate: false });

        // 2. Delete all ads from DB
        console.log('Deleting ads from DB...');
        await Anuncio.destroy({ where: {}, truncate: false });

        console.log('Database records cleared.');

        // 3. Clear public/imgs directory
        const imgsDir = path.join(__dirname, '../public/imgs');
        if (fs.existsSync(imgsDir)) {
            console.log('Cleaning up public/imgs directory...');
            const files = fs.readdirSync(imgsDir);
            for (const file of files) {
                const curPath = path.join(imgsDir, file);
                // Basic check to avoid deleting unrelated files if any (though usually it's just ID folders)
                // We should remove folders that look like IDs
                if (fs.lstatSync(curPath).isDirectory()) {
                    fs.rmSync(curPath, { recursive: true, force: true });
                    console.log(`Deleted folder: ${file}`);
                }
            }
        }

        console.log('\nSUCCESS: All ads and associated images have been removed.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

clearAds();
