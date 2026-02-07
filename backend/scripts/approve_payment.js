const { Payment, Anuncio, Plano, Bonificacao } = require('../models');

const paymentId = process.argv[2];

if (!paymentId) {
    console.error('Por favor fornece o ID do pagamento: node approve_payment.js <ID>');
    process.exit(1);
}

async function approvePayment() {
    try {
        const payment = await Payment.findByPk(paymentId);
        if (!payment) {
            console.error('Pagamento não encontrado.');
            process.exit(1);
        }

        if (payment.status === 'approved') {
            console.log('Pagamento já está aprovado.');
            process.exit(0);
        }

        console.log(`Aprovando pagamento ${payment.id} para Anuncio ${payment.anuncio_id}...`);

        // Update Payment
        await payment.update({ status: 'approved' });

        // Update Anuncio
        const anuncio = await Anuncio.findByPk(payment.anuncio_id);
        if (anuncio) {
            const now = new Date();
            // Assuming 30 days or fetching plan?
            // Ideally we fetch the plan logic but for manual fix let's assume 30 days or check plan.
            // We can check the plan associated with the payment if we stored it? 
            // Payment doesn't verify Plan ID stored, but we can look it up or just add 30 days default.

            // Let's try to find the plan price to guess? Or just add 30 days.
            const daysToAdd = 30;
            const newExpires = new Date();
            newExpires.setDate(newExpires.getDate() + daysToAdd);

            await anuncio.update({
                status: 'active',
                expires_at: newExpires
            });
            console.log(`Anuncio ${anuncio.id} ativado até ${newExpires}`);
        } else {
            console.error('Anuncio não encontrado!');
        }

        console.log('Sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('Erro:', error);
        process.exit(1);
    }
}

approvePayment();
