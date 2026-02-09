const { Payment, Anuncio, Plano, sequelize } = require('../backend/models');

async function approvePayment(externalReference) {
    if (!externalReference) {
        console.error('Por favor, forneça o ID do pagamento ou external_ref.');
        return;
    }

    try {
        await sequelize.authenticate();
        console.log(`Buscando pagamento com referência: ${externalReference}...`);

        let payment = await Payment.findOne({ where: { external_ref: externalReference } });

        if (!payment) {
            // Tentar buscar por ID se for numérico
            if (!isNaN(externalReference)) {
                console.log('Tentando buscar por ID primário...');
                payment = await Payment.findByPk(externalReference);
            }
        }

        if (!payment) {
            console.error('Pagamento não encontrado.');
            return;
        }

        console.log(`Pagamento encontrado: ID ${payment.id}, Status: ${payment.status}, Anuncio: ${payment.anuncio_id}`);

        if (payment.status === 'approved') {
            console.log('Este pagamento já está aprovado.');
            return;
        }

        // Aprovar Pagamento
        await payment.update({
            status: 'approved',
            mp_payment_data: JSON.stringify({ manual_approval: true, timestamp: new Date() })
        });
        console.log('Status do pagamento atualizado para APROVADO.');

        // Ativar Anúncio
        const anuncio = await Anuncio.findByPk(payment.anuncio_id);
        const plan = await Plano.findByPk(1); // Assumindo plano ID 1 ou lógica simples para script manual

        // Melhor seria pegar o plano original, mas na tabela pagamento não temos o plan_id salvo diretamente, inferimos do valor ou metadados
        // Simplificação: ativar por 30 dias a partir de agora
        if (anuncio) {
            const now = new Date();
            now.setDate(now.getDate() + 30); // 30 dias padrão
            await anuncio.update({
                status: 'active',
                expires_at: now
            });
            console.log(`Anúncio ${anuncio.id} ativado até ${now.toISOString()}`);
        } else {
            console.error('Anúncio associado não encontrado.');
        }

    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await sequelize.close();
    }
}

// Pega o argumento da linha de comando
const ref = process.argv[2];
approvePayment(ref);
