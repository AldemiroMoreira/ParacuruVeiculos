const sequelize = require('./backend/config/database');

async function fixData() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        console.log('Updating state_id...');
        await sequelize.query(`
            UPDATE anuncios a 
            JOIN states s ON a.state = s.abbreviation 
            SET a.state_id = s.id 
            WHERE a.state_id IS NULL AND a.state IS NOT NULL
        `);

        console.log('Updating city_id...');
        await sequelize.query(`
            UPDATE anuncios a 
            JOIN cities c ON a.city = c.name 
            JOIN states s ON c.state_id = s.id AND a.state = s.abbreviation
            SET a.city_id = c.id
            WHERE a.city_id IS NULL AND a.city IS NOT NULL
        `);

        console.log('Data fix done.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

fixData();
