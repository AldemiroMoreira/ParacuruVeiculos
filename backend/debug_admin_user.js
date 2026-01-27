const { Usuario } = require('./models');
const sequelize = require('./config/database');

async function debugUser() {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        const email = 'aldemiro.moreira@gmail.com';
        const user = await Usuario.findOne({ where: { email } });

        if (user) {
            console.log('User found:');
            console.log('ID:', user.id);
            console.log('Name:', user.nome);
            console.log('Email:', user.email);
            console.log('IsAdmin:', user.isAdmin); // Check if this field exists and is true

            // If isAdmin is false or undefined, let's fix it
            if (!user.isAdmin) {
                console.log('User is NOT admin. Attempting to fix...');
                user.isAdmin = true;
                await user.save();
                console.log('User promoted to ADMIN successfully.');
            } else {
                console.log('User IS already admin.');
            }

        } else {
            console.log('User NOT found!');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

debugUser();
