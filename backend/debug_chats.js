const { Usuario, Message, Anuncio } = require('./models');
const sequelize = require('./config/database');

async function debugChats() {
    try {
        await sequelize.authenticate();
        const fs = require('fs');
        let output = '';
        output += '--- USERS ---\n';
        const users = await Usuario.findAll();
        users.forEach(u => output += `ID: ${u.id}, Name: ${u.nome}, Email: ${u.email}\n`);

        output += '\n--- MESSAGES ---\n';
        const messages = await Message.findAll({
            include: [
                { model: Usuario, as: 'sender', attributes: ['nome'] },
                { model: Usuario, as: 'receiver', attributes: ['nome'] },
                { model: Anuncio, attributes: ['titulo'] }
            ],
            order: [['created_at', 'ASC']]
        });

        if (messages.length === 0) {
            output += 'No messages found.\n';
        } else {
            messages.forEach(m => {
                output += `[${m.id}] ${m.created_at} | ${m.sender?.nome} -> ${m.receiver?.nome} | Ad: ${m.Anuncio?.titulo} (${m.anuncio_id}) | Content: "${m.conteudo}"\n`;
            });
        }

        fs.writeFileSync('debug_chats_log.txt', output);
        console.log('Logged to debug_chats_log.txt');


    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

debugChats();
