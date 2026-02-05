const { Usuario } = require('./models');
const sequelize = require('./config/database');

(async () => {
    try {
        await sequelize.authenticate();
        const users = await Usuario.findAll({
            attributes: ['id', 'nome', 'email', 'isVerified'],
            raw: true
        });
        console.log('--- LISTA DE USUÁRIOS NO BANCO ---');
        users.forEach(u => {
            console.log(`[${u.id}] ${u.nome} - ${u.email} (Verificado: ${u.isVerified ? 'Sim' : 'Não'})`);
        });
        console.log('----------------------------------');
    } catch (e) {
        console.error('ERROR:', e.message);
    }
    process.exit(0);
})();
