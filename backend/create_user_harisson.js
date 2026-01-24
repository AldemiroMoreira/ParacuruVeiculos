const { Usuario } = require('./models');
const bcrypt = require('bcryptjs');

async function createUser() {
    try {
        const nome = "Harisson";
        const email = "harissonadv@hotamil.com";
        const passwordPlain = "856281";

        // Check if exists
        const existing = await Usuario.findOne({ where: { email } });
        if (existing) {
            console.log(`User with email ${email} already exists. ID: ${existing.id}`);
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(passwordPlain, salt);

        // Create
        const newUser = await Usuario.create({
            nome,
            email,
            password_hash
        });

        console.log(`User created successfully! ID: ${newUser.id}, Nome: ${newUser.nome}, Email: ${newUser.email}`);

    } catch (error) {
        console.error("Error creating user:", error);
    }
}

createUser();
