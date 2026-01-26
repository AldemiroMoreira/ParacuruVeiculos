const sequelize = require('./config/database');
const { EspecieVeiculo } = require('./models');

async function test() {
    try {
        console.log('Authenticating...');
        await sequelize.authenticate();
        console.log('Authenticated.');

        console.log('Syncing...');
        await sequelize.sync();
        console.log('Synced.');

        console.log('Creating Especie...');
        await EspecieVeiculo.findOrCreate({ where: { nome: 'Teste' } });
        console.log('Created.');

        process.exit(0);
    } catch (error) {
        console.error('ERROR:', error);
        process.exit(1);
    }
}

test();
