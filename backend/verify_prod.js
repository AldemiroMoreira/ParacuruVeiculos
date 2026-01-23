const sequelize = require('./config/database');
const { Usuario, Plano, City, State } = require('./models');

async function verify() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        const user = await Usuario.findOne({ where: { email: 'tcristina.mv@gmail.com' } });
        console.log('User found:', user ? user.nome : 'NO');

        const plan = await Plano.findOne({ where: { nome: 'Teste na produção!' } });
        console.log('Plan found:', plan ? `${plan.nome} (${plan.preco})` : 'NO');

        const cityCount = await City.count();
        console.log('Cities count:', cityCount);

        const stateCount = await State.count();
        console.log('States count:', stateCount);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
verify();
