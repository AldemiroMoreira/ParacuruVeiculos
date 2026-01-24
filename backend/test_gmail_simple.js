const nodemailer = require('nodemailer');
require('dotenv').config();

async function test() {
    console.log('User:', process.env.EMAIL_USER);
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'Teste GMAIL Simple',
            text: 'Funcionou!'
        });
        console.log('SUCCESS');
    } catch (e) {
        console.error('ERROR:', e);
    }
}
test();
