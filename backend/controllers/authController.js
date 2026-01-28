const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
const { Usuario } = require('../models');

// Email Transporter Helper
const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = { from: 'no-reply@paracuruveiculos.com', to, subject, text };

    // Debug log
    console.log(`--- EMAIL TO ${to} ---\nSubject: ${subject}\n${text}\n-------------------`);
    try {
        const fs = require('fs');
        const path = require('path');
        fs.appendFileSync(path.join(__dirname, '../../email_debug.txt'), `--- EMAIL TO ${to} ---\nSubject: ${subject}\n${text}\n-------------------\n`);
    } catch (e) { }

    return transporter.sendMail(mailOptions);
};

exports.register = async (req, res) => {
    try {
        const { nome, email, password } = req.body;

        if (!nome || !email || !password) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
        }

        const cleanEmail = email.trim();

        // ALERTA: Restrição de usuários mantida conforme solicitado
        const allowedEmails = [
            'aldemiro.moreira@gmail.com',
            'extcristina.mv@hotmail.com', // Corrigido de hmail.com 
            'harissonadv@hotmail.com'
        ];
        if (!allowedEmails.includes(cleanEmail)) {
            return res.status(403).json({ message: 'Cadastro restrito: Email não autorizado nesta fase de testes.' });
        }

        const existingUser = await Usuario.findOne({ where: { email: cleanEmail } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email já cadastrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate Activation Token
        const activationToken = crypto.randomBytes(20).toString('hex');

        const newUser = await Usuario.create({
            nome,
            email: cleanEmail,
            password_hash: hashedPassword,
            isVerified: false,
            activationToken: activationToken
        });

        // Send Verification Email
        const activationUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/#/activate/${activationToken}`;
        await sendEmail(
            cleanEmail,
            'Ativação de Conta - ParacuruVeículos',
            `Olá ${nome},\n\nPara ativar sua conta, clique no link abaixo:\n\n${activationUrl}\n\nObrigado!`
        );

        res.status(201).json({ message: 'Usuário criado! Verifique seu email para ativar a conta.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.activateAccount = async (req, res) => {
    try {
        const { token } = req.body;
        const user = await Usuario.findOne({ where: { activationToken: token } });

        if (!user) {
            return res.status(400).json({ message: 'Token de ativação inválido.' });
        }

        user.isVerified = true;
        user.activationToken = null;
        user.termsAcceptedAt = new Date();
        await user.save();

        res.status(200).json({ message: 'Conta ativada com sucesso! Faça login.' });
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

        if (!user.isVerified) {
            return res.status(401).json({ error: 'Conta não ativada. Verifique seu email.' });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Senha incorreta' });
        }

        const secretKey = process.env.JWT_SECRET || 'paracuru_secret_key_change_me';

        // Force Admin for specific user if DB update failed
        const isAdmin = user.isAdmin || ['tcristina.mv@gmail.com', 'aldemiro.moreira@gmail.com'].includes(cleanEmail);

        const token = jwt.sign(
            { userId: user.id, email: user.email, isAdmin: isAdmin },
            secretKey,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            token: token,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                isAdmin: isAdmin
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body; // AdminPage sends 'username' (which is email)
        const cleanEmail = username ? username.trim() : '';

        const user = await Usuario.findOne({ where: { email: cleanEmail } });

        if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) return res.status(401).json({ error: 'Credenciais inválidas' });

        // Check Admin
        // Allow hardcoded or DB
        const isAdmin = user.isAdmin || ['tcristina.mv@gmail.com', 'aldemiro.moreira@gmail.com'].includes(cleanEmail);

        if (!isAdmin) {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
        }

        const secretKey = process.env.JWT_SECRET || 'paracuru_secret_key_change_me';
        const token = jwt.sign(
            { userId: user.id, email: user.email, isAdmin: true },
            secretKey,
            { expiresIn: '2h' } // Longer session for admin
        );

        res.status(200).json({
            token: token,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                isAdmin: true
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await Usuario.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: 'Email não encontrado' });
        }

        const token = crypto.randomBytes(20).toString('hex');

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const resetUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/#/reset-password/${token}`;

        await sendEmail(
            user.email,
            'Recuperação de Senha - ParacuruVeículos',
            `Você solicitou a recuperação de senha.\n\nClique no link abaixo para redefinir sua senha:\n\n${resetUrl}`
        );

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
                resetPasswordExpires: { [Op.gt]: Date.now() }
            }
        });

        if (!user) {
            return res.status(400).json({ error: 'Token inválido ou expirado' });
        }

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

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.userData.userId; // from middleware
        const { nome, password, confirmPassword } = req.body;

        const user = await Usuario.findByPk(userId);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

        if (nome) user.nome = nome;

        if (password) {
            if (password !== confirmPassword) {
                return res.status(400).json({ error: 'Senhas não conferem' });
            }
            user.password_hash = await bcrypt.hash(password, 10);
        }

        await user.save();

        res.status(200).json({
            message: 'Perfil atualizado com sucesso!',
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
