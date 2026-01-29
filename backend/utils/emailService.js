// Mock Nodemailer for environments where install fails or config is missing
// In a real production environment, you would require('nodemailer')
const nodemailerMock = {
    createTransport: () => ({
        sendMail: async (mailOptions) => {
            console.log('--- [MOCK EMAIL SERVICE] ---');
            console.log('To:', mailOptions.to);
            console.log('Subject:', mailOptions.subject);
            console.log('Text:', mailOptions.text);
            console.log('----------------------------');
            return true;
        }
    })
};

let transporter;
try {
    const nodemailer = require('nodemailer');

    // Configuração prioritária para SMTP Genérico (Maildev, Railway, etc.)
    if (process.env.EMAIL_HOST && process.env.EMAIL_PORT) {
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false, // Geralmente false para Maildev/SMTP simples
            ignoreTLS: true, // Útil para dev/interno
            auth: process.env.EMAIL_USER ? {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            } : undefined
        });
        console.log(`Email Service: Configurado via SMTP (${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT})`);
    }
    // Fallback para Gmail (Legacy)
    else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        console.log('Email Service: Configurado via Gmail');
    } else {
        throw new Error('Nenhuma configuração de email encontrada');
    }

} catch (e) {
    console.log('Nodemailer não configurado ou falhou na inicialização, usando mock. Erro:', e.message);
    transporter = nodemailerMock.createTransport();
}

exports.sendEmail = async ({ to, subject, text }) => {
    const mailOptions = {
        from: 'no-reply@paracuruveiculos.com',
        to,
        subject,
        text
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};
