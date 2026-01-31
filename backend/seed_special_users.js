const Usuario = require('./models/Usuario');
const sequelize = require('./config/database');
const bcrypt = require('bcryptjs');

const usersToCreate = [
    {
        nome: "Alder",
        email: "aldemiro.moreira@gmail.com",
        passwordRaw: "91254413",
        isAdmin: true
    },
    {
        nome: "Harisson",
        email: "harissonadv@hotmail.com",
        passwordRaw: "85625781",
        isAdmin: true
    },
    {
        nome: "Cristina",
        email: "tcristina.mv@gmail.com",
        passwordRaw: "10042012",
        isAdmin: false
    }
];

async function seedUsers() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        for (const u of usersToCreate) {
            const existing = await Usuario.findOne({ where: { email: u.email } });

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(u.passwordRaw, salt);

            if (existing) {
                console.log(`Updating existing user: ${u.nome} (${u.email})`);
                existing.nome = u.nome;
                existing.password_hash = hashedPassword;
                existing.isAdmin = u.isAdmin;
                existing.isVerified = true; // Auto verify
                await existing.save();
            } else {
                console.log(`Creating new user: ${u.nome} (${u.email})`);
                await Usuario.create({
                    nome: u.nome,
                    email: u.email,
                    password_hash: hashedPassword,
                    isAdmin: u.isAdmin,
                    isVerified: true,
                    termsAcceptedAt: new Date()
                });
            }
        }

        console.log('All users processed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding users:', err);
        process.exit(1);
    }
}

seedUsers();
