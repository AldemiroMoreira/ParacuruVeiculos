const { Anuncio, Payment, Usuario } = require('./backend/models');
const sequelize = require('./backend/config/database');

const USER_EMAIL = 'tcristina.mv@hotmail.com';

async function fixPayment() {
    try {
        await sequelize.authenticate();
        console.log('--- CORRIGINDO REGISTRO DE PAGAMENTO (DETALHES) ---');

        const user = await Usuario.findOne({
            where: sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), 'LIKE', `%${USER_EMAIL.split('@')[0]}%`)
        });

        if (!user) { console.error('Usuário não encontrado'); return; }

        // Find the active ad 
        const ad = await Anuncio.findOne({
            where: { usuario_id: user.id, status: 'active' },
            order: [['id', 'DESC']]
        });

        if (!ad) { console.error('Nenhum anúncio ATIVO encontrado.'); return; }

        // Check if payment exists
        const payment = await Payment.findOne({ where: { anuncio_id: ad.id } });

        if (!payment) {
            console.log(`Criando registro de pagamento (com detalhes) para anúncio ${ad.id}...`);
            await Payment.create({
                external_ref: 'simulado_fix_' + Date.now(),
                amount: 80.00, // Final Price
                plan_amount: 100.00, // Base Price
                discount_amount: 20.00, // Discount
                status: 'approved',
                usuario_id: user.id,
                anuncio_id: ad.id
            });
            console.log('Registro de pagamento criado com sucesso!');
        } else {
            console.log('Registro de pagamento já existe. Atualizando detalhes...');
            await payment.update({
                plan_amount: 100.00,
                discount_amount: 20.00,
                amount: 80.00
            });
            console.log('Registro atualizado com detalhes de valores (Plano: 100, Desconto: 20, Total: 80).');
        }

    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await sequelize.close();
    }
}

fixPayment();
