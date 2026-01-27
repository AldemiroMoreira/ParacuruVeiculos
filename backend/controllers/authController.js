const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

exports.register = async (req, res) => {
    try {
        const { nome, email, password } = req.body;

        // Simple validation
        if (!nome || !email || !password) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
        }

        const cleanEmail = email.trim();

        // ALERTA: Restrição temporária de usuários para fase de testes
        // Permitir apenas "aldemiro.moreira@gmail.com" e "tcristina.mv@gmail.com"
        const allowedEmails = ['aldemiro.moreira@gmail.com', 'tcristina.mv@gmail.com'];
        if (!allowedEmails.includes(cleanEmail)) {
            return res.status(403).json({ message: 'Cadastro restrito: Email não autorizado nesta fase de testes.' });
        }

        const existingUser = await Usuario.findOne({ where: { email: cleanEmail } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email já cadastrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await Usuario.create({
            nome,
            email: cleanEmail,
            password_hash: hashedPassword
        });

        res.status(201).json({ message: 'Usuário criado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const cleanEmail = email ? email.trim() : '';

        const user = await Usuario.findOne({ where: { email: cleanEmail } });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não cadastrado' });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Senha incorreta' });
        }

        const secretKey = process.env.JWT_SECRET || 'paracuru_secret_key_change_me';
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            secretKey,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            token: token,
            user: {
                id: user.id,
                nome: user.nome, // Changed from name to nome
                email: user.email,
                isAdmin: user.isAdmin // Check if isAdmin column exists in new schema? schema.sql doesn't show it in 'usuarios'. Maybe legacy check.
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

// Mock removed. Real nodemailer is now used.


exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await Usuario.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: 'Email não encontrado' });
        }

        // Generate token
        const token = crypto.randomBytes(20).toString('hex');

        // Set token and expiry (1 hour)
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Config nodemailer (using placeholder or env vars)
        // NOTE: For now using a test account or assuming env vars are set
        // In production, use real credentials from process.env
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
            port: process.env.EMAIL_PORT || 2525,
            auth: {
                user: process.env.EMAIL_USER || 'user',
                pass: process.env.EMAIL_PASS || 'pass'
            }
        });

        const resetUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/#/reset-password/${token}`;

        const mailOptions = {
            from: 'no-reply@paracuruveiculos.com',
            to: user.email,
            subject: 'Recuperação de Senha - ParacuruVeículos',
            text: `Você solicitou a recuperação de senha.\n\n` +
                `Clique no link abaixo para redefinir sua senha:\n\n` +
                `${resetUrl}\n\n` +
                `Se você não solicitou isso, ignore este email.\n`
        };

        // ALWAYS Log for Debugging (since we are mocking)
        const logMsg = `--- LINK DE RECUPERAÇÃO (${new Date().toISOString()}) ---\n${resetUrl}\n--------------------------------------\n`;
        console.log(logMsg);

        try {
            const fs = require('fs');
            const path = require('path');
            fs.appendFileSync(path.join(__dirname, '../../email_debug.txt'), logMsg);
        } catch (e) { console.error("Error writing debug log", e); }

        // Attempt to send email
        try {
            await transporter.sendMail(mailOptions);
        } catch (emailErr) {
            console.error('Erro ao enviar email:', emailErr);
        }

        res.status(200).json({ message: 'Email de recuperação enviado!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao processar solicitação' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        const user = await Usuario.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { [Op.gt]: Date.now() } // Expires > now
            }
        });

        if (!user) {
            return res.status(400).json({ error: 'Token inválido ou expirado' });
        }

        // Update password
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password_hash = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.status(200).json({ message: 'Senha alterada com sucesso!' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
