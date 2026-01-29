const nodemailer = require('nodemailer');
require('dotenv').config();

async function testConnection() {
    console.log('--- Teste de Conexão SMTP / Maildev ---');
    console.log('Host:', process.env.EMAIL_HOST);
    console.log('Port:', process.env.EMAIL_PORT);
    console.log('User:', process.env.EMAIL_USER || '(sem usuário)');

    if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT) {
        console.error('ERRO: EMAIL_HOST e EMAIL_PORT precisam estar definidos no .env');
        return;
    }

    const transportConfig = {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // Geralmente false para porta 1025/587 sem SSL implícito
        tls: {
            rejectUnauthorized: false // Aceitar certificados auto-assinados (comum em dev)
        }
    };

    // Adiciona autenticação apenas se definida
    if (process.env.EMAIL_USER) {
        transportConfig.auth = {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        };
    }

    const transporter = nodemailer.createTransport(transportConfig);

    try {
        console.log('Tentando verificar conexão...');
        await transporter.verify();
        console.log('SUCESSO: Conexão com o servidor SMTP estabelecida!');

        console.log('Tentando enviar email de teste...');
        const info = await transporter.sendMail({
            from: 'teste@paracuruveiculos.com',
            to: 'admin@paracuruveiculos.com',
            subject: 'Teste de Integração Maildev',
            text: 'Se você está lendo isso, o Maildev (ou SMTP) está configurado corretamente!'
        });
        console.log('Email enviado:', info.messageId);

        // Se for Maildev, avisar como ver
        console.log('\nVerifique a interface web do Maildev para confirmar o recebimento.');

    } catch (error) {
        console.error('FALHA: Erro ao conectar ou enviar email.');
        console.error(error);
    }
}

testConnection();
