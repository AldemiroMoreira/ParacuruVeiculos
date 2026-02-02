const fs = require('fs');
const { Message } = require('./models');

async function inspectMessage() {
    try {
        console.log('Fetching messages for Ad 24...');

        const messages = await Message.findAll({
            where: {
                anuncio_id: 24
            },
            raw: true
        });

        let output = `Found ${messages.length} messages.\n`;

        if (messages.length > 0) {
            output += 'First message structure:\n';
            output += JSON.stringify(messages[0], null, 2);
        }

        fs.writeFileSync('verify_output.txt', output);
        console.log('Written to verify_output.txt');

    } catch (error) {
        console.error('Error:', error);
        fs.writeFileSync('verify_output.txt', 'Error: ' + error.message);
    }
}

inspectMessage();
