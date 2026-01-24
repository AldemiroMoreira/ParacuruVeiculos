const emailService = require('./utils/emailService');
require('dotenv').config();

async function testEmail() {
    console.log('Testing email with:');
    console.log('User:', process.env.EMAIL_USER);
    // Don't log full pass
    console.log('Pass:', process.env.EMAIL_PASS ? '******' : 'Not Set');

    const result = await emailService.sendEmail({
        to: process.env.EMAIL_USER, // Send to self
        subject: 'Teste ParacuruVeiculos',
        text: 'Se você recebeu isso, o email está funcionando!'
    });

    if (result) {
        console.log('SUCCESS: Email sent.');
    } else {
        console.log('FAILED: Email not sent.');
    }
}

testEmail();
