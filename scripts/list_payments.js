const { Payment, sequelize } = require('../backend/models');
const fs = require('fs');

async function listPayments() {
    try {
        await sequelize.authenticate();
        console.log('--- Últimos 15 Pagamentos ---');
        const payments = await Payment.findAll({
            limit: 15,
            order: [['created_at', 'DESC']],
            raw: true
        });
        console.log(`Encontrados ${payments.length} pagamentos.`);
        fs.writeFileSync('payments_log.json', JSON.stringify(payments, null, 2));
    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await sequelize.close();
    }
}

listPayments();
