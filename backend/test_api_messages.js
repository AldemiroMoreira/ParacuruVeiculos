const { Message, Usuario, Anuncio, AnuncioImage } = require('./models');
const { Op } = require('sequelize');

async function testApi() {
    try {
        const userId = 1; // Alder
        const anuncioId = 24;
        const otherUserId = 14; // Cristina

        console.log(`Fetching messages for User ${userId}, Ad ${anuncioId}, Other ${otherUserId}...`);

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

        console.log(`Found ${messages.length} messages.`);
        messages.forEach(m => {
            console.log(`[${m.id}] ${m.conteudo} (From: ${m.remetente_id})`);
        });

    } catch (error) {
        console.error(error);
    }
}

testApi();
