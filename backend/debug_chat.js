const { Message, Usuario, Anuncio, AnuncioImage } = require('./models');
const { Op } = require('sequelize');

const fs = require('fs');

async function debugChat() {
    try {
        let output = '';
        output += 'Fetching all messages with Anuncio include...\n';

        // Fetch all messages to see what happens
        const messages = await Message.findAll({
            include: [
                { model: Usuario, as: 'sender', attributes: ['id', 'nome'] },
                { model: Usuario, as: 'receiver', attributes: ['id', 'nome'] },
                {
                    model: Anuncio,
                    attributes: ['id', 'titulo', 'expires_at', 'status'],
                    include: [{ model: AnuncioImage, as: 'images', limit: 1 }]
                }
            ],
            order: [['created_at', 'DESC']],
            limit: 50 // Increased limit
        });

        output += `Found ${messages.length} messages.\n`;

        messages.forEach(msg => {
            output += '--------------------------------------------------\n';
            output += `Msg ID: ${msg.id}\n`;
            output += `Sender: ${msg.sender ? msg.sender.nome : 'Unknown'} (${msg.remetente_id})\n`;
            output += `Receiver: ${msg.receiver ? msg.receiver.nome : 'Unknown'} (${msg.destinatario_id})\n`;
            output += `Anuncio ID: ${msg.anuncio_id}\n`;

            if (msg.Anuncio) {
                output += `Anuncio Found: ${msg.Anuncio.titulo}\n`;
                output += `Anuncio Expires At: ${msg.Anuncio.expires_at}\n`;
                output += `Anuncio Status: ${msg.Anuncio.status}\n`;
            } else {
                output += 'Anuncio NOT FOUND (msg.Anuncio is null)\n';
            }
        });

        fs.writeFileSync('debug_output.txt', output);
        console.log('Output written to debug_output.txt');

    } catch (error) {
        console.error('Error debugging chat:', error);
        fs.writeFileSync('debug_output.txt', 'Error: ' + error.message);
    }
}

debugChat();
