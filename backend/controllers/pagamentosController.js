const mp = require('mercadopago');
const { MercadoPagoConfig, Preference } = mp;
console.log('MP EXPORTS DEBUG:', Object.keys(mp));
const { Payment, Anuncio, Plano, Usuario, Bonificacao } = require('../models');

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

        // RENEWAL BONUS LOGIC
        // Check if ad is active and not expired (or close to expiry) to be considered a "Renewal"
        // If expires_at > now, it is a renewal.
        let finalPrice = Number(plan.preco);
        let isRenewal = false;
        let discountAmount = 0;

        if (anuncio.expires_at && new Date(anuncio.expires_at) > new Date()) {
            isRenewal = true;
            discountAmount = finalPrice * 0.20; // 20% discount
            finalPrice = finalPrice - discountAmount;
        }

        // Fallback for Preference class availability
        const PreferenceClass = Preference || mp.Preference;
        if (!PreferenceClass) throw new Error('MercadoPago Preference class not found');

        const preference = new PreferenceClass(client);

        const title = isRenewal
            ? `Renovação: ${anuncio.titulo} (${plan.nome}) - 20% OFF`
            : `Anúncio: ${anuncio.titulo} (${plan.nome})`;

        const body = {
            items: [
                {
                    id: `PLAN-${plan.id}`,
                    title: title,
                    quantity: 1,
                    unit_price: finalPrice,
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
                plan_id: plan.id,
                is_renewal: isRenewal,
                discount_amount: discountAmount
            },
            payment_methods: {
                excluded_payment_types: [],
                excluded_payment_methods: [],
                installments: 12
            }
        };

        const result = await preference.create({ body });

        // Save initial payment attempt
        await Payment.create({
            external_ref: result.id,
            amount: finalPrice,
            plan_amount: Number(plan.preco),
            discount_amount: discountAmount,
            status: 'pending',
            usuario_id: usuario_id,
            anuncio_id: anuncio.id
        });

        res.status(200).json({
            init_point: result.init_point,
            sandbox_init_point: result.sandbox_init_point,
            isRenewal,
            discountAmount: discountAmount
        });

    } catch (error) {
        console.error('Erro Mercado Pago:', error.message);
        res.status(500).json({ error: 'Erro ao criar preferência de pagamento', details: error.message });
    }
};

exports.webhook = async (req, res) => {
    try {
        const { type, data } = req.body;
        const topic = req.query.topic || type;
        const id = req.query.id || data?.id;

        if (topic === 'payment' && id) {
            console.log(`Payment Webhook received for ID: ${id}`);

            // Instantiate MP Payment Client
            // We use mp.Payment because Payment is occupied by our model
            const PaymentClient = mp.Payment;
            const paymentClient = new PaymentClient(client);

            const paymentInfo = await paymentClient.get({ id });

            if (paymentInfo.status === 'approved') {
                const metadata = paymentInfo.metadata;
                const anuncioId = metadata.anuncio_id;
                const planId = metadata.plan_id;
                const isRenewal = metadata.is_renewal === 'true' || metadata.is_renewal === true;
                const discountAmount = Number(metadata.discount_amount || 0);

                const anuncio = await Anuncio.findByPk(anuncioId);
                const plan = await Plano.findByPk(planId);

                if (anuncio && plan) {
                    let newExpiresAt;
                    const planDays = plan.duracao_dias;

                    if (isRenewal && anuncio.expires_at && new Date(anuncio.expires_at) > new Date()) {
                        // Add to existing expiration
                        const currentExpires = new Date(anuncio.expires_at);
                        currentExpires.setDate(currentExpires.getDate() + planDays);
                        newExpiresAt = currentExpires;
                    } else {
                        // Set from now
                        const now = new Date();
                        now.setDate(now.getDate() + planDays);
                        newExpiresAt = now;
                    }

                    // Update Anuncio
                    await anuncio.update({
                        status: 'active',
                        expires_at: newExpiresAt
                    });

                    // Update Local Payment Record
                    const localPayment = await Payment.findOne({ where: { external_ref: String(id) } });
                    if (localPayment) {
                        await localPayment.update({ status: 'approved' });
                    }

                    // Record Bonus if applicable
                    if (isRenewal && discountAmount > 0) {
                        await Bonificacao.create({
                            usuario_id: metadata.user_id,
                            anuncio_id: anuncioId,
                            tipo: 'renovacao_antecipada',
                            payment_id: String(id),
                            valor_desconto: discountAmount
                        });
                        console.log(`Bônus registrado: R$ ${discountAmount} para Anuncio ${anuncioId}`);
                    }

                    console.log(`Anuncio ${anuncioId} renovado/ativado até ${newExpiresAt}`);
                }
            }
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('Webhook Error:', error);
        // Return 200 to avoid MP retries if it's a code error, or 500 if transient.
        // Usually 200 is safer to prevent loop if error is permanent.
        res.status(200).send('Error');
    }
};
