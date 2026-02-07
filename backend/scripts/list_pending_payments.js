const { Payment, Usuario, Anuncio, Plano } = require('../models');

async function listPending() {
    try {
        const pendingPayments = await Payment.findAll({
            where: { status: 'pending' },
            include: [
                { model: Usuario, attributes: ['email', 'nome'] },
                { model: Anuncio, attributes: ['titulo', 'id'] },
                // Plano relationship might not be set up in model directly for include if not defined, strictly relying on IDs
            ],
            order: [['created_at', 'DESC']]
        });

        console.log('--- Pagamentos Pendentes ---');
        if (pendingPayments.length === 0) {
            console.log('Nenhum pagamento pendente encontrado.');
        } else {
            pendingPayments.forEach(p => {
                const userEmail = p.Usuario ? p.Usuario.email : 'Desconhecido';
                const adTitle = p.Anuncio ? p.Anuncio.titulo : 'Desconhecido';
                console.log(`ID: ${p.id} | Data: ${p.created_at} | Valor: ${p.amount} | User: ${userEmail} | Anuncio: ${adTitle} (ID: ${p.anuncio_id}) | ExtRef: ${p.external_ref}`);
            });
        }
        process.exit(0);
    } catch (error) {
        console.error('Erro:', error);
        process.exit(1);
    }
}

listPending();
