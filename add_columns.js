const sequelize = require('./backend/config/database');

async function addCols() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected. Adding columns...');

        try {
            await sequelize.query("ALTER TABLE pagamentos ADD COLUMN plan_amount DECIMAL(10,2);");
            console.log('Added plan_amount');
        } catch (e) {
            console.log('plan_amount might already exist:', e.message);
        }

        try {
            await sequelize.query("ALTER TABLE pagamentos ADD COLUMN discount_amount DECIMAL(10,2);");
            console.log('Added discount_amount');
        } catch (e) {
            console.log('discount_amount might already exist:', e.message);
        }

    } catch (e) {
        console.error('Connection Error:', e);
    } finally {
        await sequelize.close();
    }
}

addCols();
