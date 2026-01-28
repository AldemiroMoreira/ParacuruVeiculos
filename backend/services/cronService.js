const { Op } = require('sequelize');
const { Anuncio, Usuario, AnuncioImage } = require('../models');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Email Transporter (reuse from authController logic optimally, but defining here for isolation)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendAlertEmail = async (email, adTitle, daysLeft) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"Paracuru Veículos" <no-reply@paracuruveiculos.com.br>',
            to: email,
            subject: `Seu anúncio expira em ${daysLeft} dias!`,
            html: `
                <h3>Olá!</h3>
                <p>O seu anúncio <strong>${adTitle}</strong> está prestes a expirar.</p>
                <p>Você tem <strong>${daysLeft} dias</strong> restantes.</p>
                <p>Aproveite para renovar ou, se já vendeu, você pode editar o anúncio para vender outro veículo usando o mesmo prazo restante!</p>
                <br>
                <a href="${process.env.BASE_URL}/#/my-ads">Gerenciar Meus Anúncios</a>
            `
        });
        console.log(`Alert email sent to ${email} for ad ${adTitle}`);
    } catch (error) {
        console.error('Error sending alert email:', error);
    }
};

const checkExpirations = async () => {
    console.log('Running expiration check...');
    try {
        const now = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(now.getDate() + 3);

        // --- 1. ALERTS (Expiring in 3 days) ---
        // Find active ads expiring between now+2d and now+3d (approx) to avoid sending multiple times?
        // Better: Check for a flag 'alert_sent'? 
        // For MVP, simplistic check: 
        // We really should mark them. Let's assume we run this once a day. 
        // Or we strictly look for Date Diff = 3.

        const expiringAds = await Anuncio.findAll({
            where: {
                status: 'active',
                expires_at: {
                    [Op.between]: [now, threeDaysFromNow]
                }
            },
            include: [{ model: Usuario, attributes: ['email'] }]
        });

        // This simplistic logic might spam if run hourly. 
        // Correct way without DB schema change: Check only if (expires_at - now) is between 72h and 73h.
        // Let's refine. 'expires_at' is a specific moment.
        // If we run hourly, we check: is expires_at between (Now + 72h) and (Now + 73h)?

        const startTarget = new Date(now.getTime() + (72 * 60 * 60 * 1000)); // Now + 3 days
        const endTarget = new Date(now.getTime() + (73 * 60 * 60 * 1000));   // Now + 3 days + 1 hour

        const adsToAlert = await Anuncio.findAll({
            where: {
                status: 'active',
                expires_at: {
                    [Op.between]: [startTarget, endTarget]
                }
            },
            include: [{ model: Usuario, attributes: ['email'] }]
        });

        for (const ad of adsToAlert) {
            if (ad.Usuario && ad.Usuario.email) {
                await sendAlertEmail(ad.Usuario.email, ad.titulo, 3);
            }
        }

        // --- 2. CLEANUP (Expired) ---
        const expiredAds = await Anuncio.findAll({
            where: {
                status: 'active',
                expires_at: {
                    [Op.lt]: now
                }
            }
        });

        for (const ad of expiredAds) {
            console.log(`Ad ${ad.id} expired. Cleaning up images...`);

            // Delete images folder
            const adDir = path.join(__dirname, '../../public/imgs', String(ad.id));
            if (fs.existsSync(adDir)) {
                fs.rmSync(adDir, { recursive: true, force: true });
            }

            // Remove from DB (Images)
            await AnuncioImage.destroy({ where: { anuncio_id: ad.id } });

            // Update status
            await ad.update({ status: 'expired' });
        }

    } catch (error) {
        console.error('Error in cron job:', error);
    }
};

const initCron = () => {
    // Run every hour
    setInterval(checkExpirations, 60 * 60 * 1000);

    // Run immediately on startup for verification (optional, good for verifying now)
    // checkExpirations(); 
    console.log('Cron service initialized (Hourly checks).');
};

module.exports = { initCron };
