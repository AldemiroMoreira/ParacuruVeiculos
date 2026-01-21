const mp = require('mercadopago');
const { MercadoPagoConfig, Preference } = mp;
console.log('MP EXPORTS DEBUG:', Object.keys(mp));
const { Payment, Anuncio, Plano, Usuario } = require('../models');

// Configure Mercado Pago
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

exports.createPreference = async (req, res) => {
    try {
        const { anuncioId, planId } = req.body;
        const usuario_id = req.userData.userId;

        const anuncio = await Anuncio.findOne({ where: { id: anuncioId, usuario_id: usuario_id } });
        if (!anuncio) {
            return res.status(404).json({ message: 'Anúncio não encontrado' });
        }

        const plan = await Plano.findByPk(planId);
        if (!plan) {
            return res.status(404).json({ message: 'Plano não encontrado' });
        }

        const user = await Usuario.findByPk(usuario_id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Fallback for Preference class availability
        const PreferenceClass = Preference || mp.Preference;
        if (!PreferenceClass) throw new Error('MercadoPago Preference class not found');

        const preference = new PreferenceClass(client);

        const body = {
            items: [
                {
                    id: `PLAN-${plan.id}`,
                    title: `Anúncio: ${anuncio.titulo} (${plan.nome})`,
                    quantity: 1,
                    unit_price: Number(plan.preco),
                    currency_id: 'BRL'
                }
            ],
            payer: {
                email: user.email
            },
            back_urls: {
                success: `${process.env.BASE_URL}/api/pagamentos/success`,
                failure: `${process.env.BASE_URL}/api/pagamentos/failure`,
                pending: `${process.env.BASE_URL}/api/pagamentos/pending`
            },
            metadata: {
                anuncio_id: anuncio.id,
                user_id: usuario_id,
                plan_id: plan.id
            }
        };

        const result = await preference.create({ body });

        // Save initial payment attempt
        await Payment.create({
            external_ref: result.id,
            amount: plan.preco,
            status: 'pending',
            usuario_id: usuario_id,
            anuncio_id: anuncio.id
        });

        res.status(200).json({ init_point: result.init_point, sandbox_init_point: result.sandbox_init_point });

    } catch (error) {
        console.error('Erro Mercado Pago:', error.message);
        res.status(500).json({ error: 'Erro ao criar preferência de pagamento', details: error.message });
    }
};

exports.webhook = async (req, res) => {
    try {
        // Mercado Pago sends the topic/type and id in the query or body
        // For 'payment', we check the ID
        const { type, data } = req.body;
        const topic = req.query.topic || type;
        const id = req.query.id || data?.id;

        if (topic === 'payment' && id) {
            // Check payment status from MP API (optional but recommended)
            // For MVP, we might trust the webhook body if it contains status, 
            // but usually we fetch it to be sure.

            // Note: In a real app, use the Payment client to fetch details.
            // keeping it simple for MVP structure. 
            // Assume we receive status in body or fetch it.

            // Update Payment in DB
            // const paymentInfo = await paymentClient.get({ id }); 
            // if (paymentInfo.status === 'approved') { ... }

            console.log(`Payment Webhook received for ID: ${id}`);
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error');
    }
};
