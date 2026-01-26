const sequelize = require('./config/database');
const { runSeed } = require('./services/seeder');

async function seed() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected! Syncing models...');
        await sequelize.sync();

        const result = await runSeed();
        console.log(result.message);

        console.log('✅ Seeding completed via Service!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
