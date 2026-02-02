const { Anuncio, Bonificacao, Payment, Usuario } = require('./backend/models');
const sequelize = require('./backend/config/database');

// CONFIGURAÇÃO DA SIMULAÇÃO
const USER_EMAIL = 'tcristina.mv@hotmail.com'; // Email do usuário para buscar
const PLAN_DAYS = 30; // Dias do plano
const SIMULATE_RENEWAL = true; // Simular que foi uma renovação antecipada?

async function simulate() {
    try {
        await sequelize.authenticate();
        console.log('--- SIMULANDO PAGAMENTO APROVADO ---');

        // 1. Achar o usuário
        const user = await Usuario.findOne({
            where: sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), 'LIKE', `%${USER_EMAIL.split('@')[0]}%`)
        });

        if (!user) {
            console.error('Usuário não encontrado!');
            return;
        }
        console.log(`Usuário encontrado: ${user.nome} (ID: ${user.id})`);

        // 2. Achar o último anúncio pendente
        const ad = await Anuncio.findOne({
            where: { usuario_id: user.id, status: 'pending_payment' },
            order: [['created_at', 'DESC']]
        });

        if (!ad) {
            console.error('Nenhum anúncio PENDENTE encontrado para este usuário.');
            return;
        }
        console.log(`Anúncio encontrado: ${ad.titulo} (ID: ${ad.id})`);

        // 3. Simular Lógica de Aprovação
        let newExpiresAt;

        // Se quisermos forçar o comportamento de "Renovação", precisamos fingir que ele expirava no futuro.
        // Mas o anúncio foi recém criado, então ele não tem expires_at ou está null?
        // Se for novo, é null.

        const now = new Date();
        if (ad.expires_at && new Date(ad.expires_at) > now) {
            console.log('Detectada Renovação (Data futura existente). Somando dias...');
            const current = new Date(ad.expires_at);
            current.setDate(current.getDate() + PLAN_DAYS);
            newExpiresAt = current;
        } else {
            console.log('Ativação Normal (Iniciando contagem agora).');
            const newDate = new Date();
            newDate.setDate(newDate.getDate() + PLAN_DAYS);
            newExpiresAt = newDate;
        }

        // 4. Atualizar Anuncio
        await ad.update({
            status: 'active',
            expires_at: newExpiresAt
        });
        console.log(`STATUS ATUALIZADO: active`);
        console.log(`NOVA VALIDADE: ${newExpiresAt.toISOString()}`);

        // 5. Atualizar Pagamento Local (se existir)
        const payment = await Payment.findOne({
            where: { anuncio_id: ad.id, status: 'pending' },
            order: [['created_at', 'DESC']]
        });

        if (payment) {
            await payment.update({ status: 'approved' });
            console.log(`Pagamento local ID ${payment.id} marcado como APROVADO.`);
        } else {
            console.log('Nenhum registro de pagamento pendente encontrado (ok se for teste manual).');
        }

        // 6. Criar Bonificação (Simulada)
        if (SIMULATE_RENEWAL) {
            await Bonificacao.create({
                usuario_id: user.id,
                anuncio_id: ad.id,
                tipo: 'renovacao_antecipada',
                payment_id: 'simulado_' + Date.now(),
                valor_desconto: 16.00 // 20% de 80
            });
            console.log('Registro de BONIFICAÇÃO criado com sucesso.');
        }

        console.log('--- SIMULAÇÃO CONCLUÍDA ---');

    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await sequelize.close();
    }
}

simulate();
