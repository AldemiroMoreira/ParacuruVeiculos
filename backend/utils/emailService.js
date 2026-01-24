// Mock Nodemailer for environments where install fails or config is missing
// In a real production environment, you would require('nodemailer')
const nodemailerMock = {
    createTransport: () => ({
        sendMail: async (mailOptions) => {
            console.log('--- [MOCK EMAIL SERVICE] ---');
            console.log('To:', mailOptions.to);
            console.log('Subject:', mailOptions.subject);
            console.log('Text:', mailOptions.text);
            console.log('----------------------------');
            return true;
        }
    })
};

let transporter;
try {
    const nodemailer = require('nodemailer');
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
} catch (e) {
    console.log('Nodemailer not found or failed to initialize, using mock.');
    transporter = nodemailerMock.createTransport();
}

exports.sendEmail = async ({ to, subject, text }) => {
    const mailOptions = {
        from: 'no-reply@paracuruveiculos.com',
        to,
        subject,
        text
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};
