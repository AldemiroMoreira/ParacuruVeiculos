const sequelize = require('./backend/config/database');

async function checkTables() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        const [results, metadata] = await sequelize.query("SHOW TABLES;");
        console.log('Tables:', results);

        // Check columns of anuncio_images
        try {
            const [columns] = await sequelize.query("DESCRIBE anuncio_images;");
            console.log('anuncio_images structure:', columns);
        } catch (e) {
            console.log('anuncio_images table probably does not exist.');
        }

        // Check columns of anuncios
        try {
            const [cols2] = await sequelize.query("DESCRIBE anuncios;");
            console.log('anuncios structure:', cols2);
        } catch (e) {
            console.log('anuncios table probably does not exist.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkTables();
