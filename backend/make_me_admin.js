const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Usuario } = require('./models');

async function makeAdmin(email) {
    try {
        const user = await Usuario.findOne({ where: { email } });
        if (!user) {
            console.log('User not found');
            return;
        }
        user.isAdmin = true;
        await user.save();
        console.log(`User ${email} is now Admin.`);
    } catch (e) {
        console.error(e);
    }
}

// Set your email here or pass as arg
makeAdmin('tcristina.mv@gmail.com'); 
