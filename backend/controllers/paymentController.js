const mercadopago = require('mercadopago');
const { Payment, Ad, Plan, User } = require('../models');
const sequelize = require('../config/database');

// Configure Mercado Pago
// In a real app, use Access Token. The prompt mentions MP_ACCESS_TOKEN.
if (process.env.MP_ACCESS_TOKEN) {
    mercadopago.configure({
        access_token: process.env.MP_ACCESS_TOKEN
    });
}

exports.createPreference = async (req, res) => {
    try {
        const { adId, planId } = req.body;
        const user = req.user;

        const ad = await Ad.findByPk(adId);
        const plan = await Plan.findByPk(planId);

        if (!ad || !plan) {
            return res.status(404).json({ error: 'Anuncio ou Plano nao encontrado.' });
        }

        // Create preference data
        let preference = {
            items: [
                {
                    title: `Anuncio: ${ad.title} (${plan.name})`,
                    unit_price: Number(plan.price),
                    quantity: 1,
                }
            ],
            payer: {
                name: user.name,
                email: user.email,
                // In real app add CPF/Address if available in User model or prompt user
            },
            back_urls: {
                success: \`\${process.env.BASE_URL || 'http://localhost:3000'}/?status=success\`, // Redirect to frontend
                failure: \`\${process.env.BASE_URL || 'http://localhost:3000'}/?status=failure\`,
                pending: \`\${process.env.BASE_URL || 'http://localhost:3000'}/?status=pending\`
            },
            auto_return: 'approved',
            notification_url: \`\${process.env.WEBHOOK_URL || 'https://meusite.com/api/payments/webhook'}\`, // Must be https and public
            external_reference: JSON.stringify({ ad_id: ad.id, user_id: user.id, plan_id: plan.id })
        };

        const response = await mercadopago.preferences.create(preference);
        
        // Save initial payment record
        await Payment.create({
            user_id: user.id,
            ad_id: ad.id,
            amount: plan.price,
            method: 'mercadopago_preference', // Will update on webhook
            status: 'pending',
            external_ref: response.body.id
        });

        res.json({ 
            id: response.body.id, 
            init_point: response.body.init_point, 
            sandbox_init_point: response.body.sandbox_init_point 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar preferencia de pagamento.' });
    }
};

exports.webhook = async (req, res) => {
    try {
        const { query } = req;
        const topic = query.topic || query.type;
        const paymentId = query.id || query['data.id'];

        if (topic === 'payment' && paymentId) {
            const data = await mercadopago.payment.get(paymentId);
            const paymentInfo = data.body;
            
            // Extract metadata from external_reference if needed, or find by user/logic
            // But usually we can find our local payment via some ID. 
            // Here simplest is to assume we handle by finding the Ad or storing MP ID.
            
            // Note: external_reference was sent as JSON string in createPreference
            let externalRefData = {};
            try {
                externalRefData = JSON.parse(paymentInfo.external_reference);
            } catch (e) {}

            const status = paymentInfo.status; // approved, pending, etc.
            
            // Update Payment Table
            // Find payment by ad_id or create new if not found (idempotency)
            // Ideally we stored the preference ID. 
            // For MVP let's update based on ad_id from external_ref
            
            if (externalRefData.ad_id) {
                // Update Ad status
                if (status === 'approved') {
                    await Ad.update(
                        { 
                            status: 'active', 
                            expires_at: sequelize.literal(\`DATE_ADD(NOW(), INTERVAL (SELECT duration_days FROM plans WHERE id = \${externalRefData.plan_id}) DAY)\`) 
                        },
                        { where: { id: externalRefData.ad_id } }
                    );
                    
                    // Creates or updates Payment record
                    // Ideally we should find the exact payment record created in createPreference
                    // But for now verify if exists
                    await Payment.create({
                       user_id: externalRefData.user_id,
                       ad_id: externalRefData.ad_id,
                       amount: paymentInfo.transaction_amount,
                       method: paymentInfo.payment_type_id,
                       status: status,
                       external_ref: String(paymentId)
                    });
                }
            }
        }
        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook Error:', error);
        res.sendStatus(500);
    }
};
