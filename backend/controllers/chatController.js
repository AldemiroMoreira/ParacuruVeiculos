const { Message, Usuario, Anuncio, AnuncioImage } = require('../models');
const { Op } = require('sequelize');

const emailService = require('../utils/emailService');
const imageValidator = require('../utils/imageValidator');

exports.sendMessage = async (req, res) => {
    try {
        const { destinatario_id, anuncio_id, conteudo } = req.body;
        const remetente_id = req.userData.userId; // From middleware

        // Check if file, if so add path
        let imagem = null;
        if (req.file) {
            imagem = `/uploads/${req.file.filename}`;
            const isValidVehicle = await imageValidator.validateImageContent(req.file.path);
            if (!isValidVehicle) {
                // Should delete file if invalid
                const fs = require('fs');
                if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

                return res.status(400).json({ message: 'Imagem inválida. O sistema aceita apenas fotos de veículos.' });
            }
        }

        if (!destinatario_id || !anuncio_id || (!conteudo && !imagem)) {
            return res.status(400).json({ message: 'Dados incompletos' });
        }

        const message = await Message.create({
            remetente_id,
            destinatario_id,
            anuncio_id,
            conteudo: conteudo || '', // Allow empty content if image exists
            imagem
        });

        // Fetch details for email
        const destinatario = await Usuario.findByPk(destinatario_id);
        const remetente = await Usuario.findByPk(remetente_id);
        const anuncio = await Anuncio.findByPk(anuncio_id);

        if (destinatario && destinatario.email) {
            const subject = `Nova mensagem sobre: ${anuncio ? anuncio.titulo : 'Seu anúncio'}`;
            const text = `Olá ${destinatario.nome || 'Usuário'},\n\n` +
                `Você recebeu uma nova mensagem de ${remetente ? remetente.nome : 'alguém'} sobre o anúncio "${anuncio ? anuncio.titulo : 'Veículo'}".\n\n` +
                `Mensagem:\n"${conteudo}"\n\n` +
                `Acesse a plataforma para responder.`;

            // Send email asynchronously (don't wait for it to reply to API)
            emailService.sendEmail({
                to: destinatario.email,
                subject,
                text
            });
        }

        res.status(201).json(message);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getConversations = async (req, res) => {
    try {
        const userId = req.userData.userId;

        // Get all unique users interacted with
        // This is complex in Sequelize with raw SQL often being easier for "Distinct conversations"
        // But let's try to get all messages where user is sender OR receiver
        // And group by the other person.

        // Simpler approach for MVP:
        // Get all messages involving user, then process in JS (might be slow if millions of messages but ok for MVP)
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { remetente_id: userId },
                    { destinatario_id: userId }
                ]
            },
            include: [
                { model: Usuario, as: 'sender', attributes: ['id', 'nome'] },
                { model: Usuario, as: 'receiver', attributes: ['id', 'nome'] },
                {
                    model: Anuncio,
                    attributes: ['id', 'titulo'],
                    include: [{ model: AnuncioImage, as: 'images', limit: 1 }]
                }
            ],
            order: [['created_at', 'DESC']]
        });

        // Group by conversation (anuncio_id + other_user_id)
        const conversations = {};

        messages.forEach(msg => {
            const isSender = msg.remetente_id === userId;
            const otherUserId = isSender ? msg.destinatario_id : msg.remetente_id;
            const otherUser = isSender ? msg.receiver : msg.sender;

            const key = `${msg.anuncio_id}-${otherUserId}`;

            if (!conversations[key]) {
                conversations[key] = {
                    key,
                    otherUser,
                    anuncio: msg.Anuncio,
                    lastMessage: msg,
                    unreadCount: 0
                };
            }

            if (!isSender && !msg.lida) {
                conversations[key].unreadCount++;
            }
        });

        res.status(200).json(Object.values(conversations));

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const userId = req.userData.userId;
        const { anuncioId, otherUserId } = req.params;

        const messages = await Message.findAll({
            where: {
                anuncio_id: anuncioId,
                [Op.or]: [
                    { remetente_id: userId, destinatario_id: otherUserId },
                    { remetente_id: otherUserId, destinatario_id: userId }
                ]
            },
            order: [['created_at', 'ASC']]
        });

        // Mark as read
        await Message.update({ lida: true }, {
            where: {
                anuncio_id: anuncioId,
                remetente_id: otherUserId,
                destinatario_id: userId,
                lida: false
            }
        });

        res.status(200).json(messages);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
