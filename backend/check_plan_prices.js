const { Plano } = require('./models');
const sequelize = require('./config/database');

async function checkPlans() {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        const planos = await Plano.findAll();
        console.log('--- PLANOS NO BANCO DE DADOS ---');
        planos.forEach(p => {
            console.log(`ID: ${p.id} | Nome: ${p.nome} | Preço: ${p.preco} | Dias: ${p.duracao_dias}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkPlans();
