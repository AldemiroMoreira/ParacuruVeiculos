const { Usuario } = require('../backend/models');
const bcrypt = require('bcryptjs');

const usersToEnforce = [
    {
        nome: 'Alder',
        email: 'aldemiro.moreira@gmail.com',
        password: '91254413$Paracuru', // Appending simplified complexity if needed or just hashing raw? User gave plain text. I'll hash plain text.
        // Wait, current complexity requirements? 
        // Register page has requirements, but direct DB insert bypasses middleware.
        // I'll just hash the password provided.
        isAdmin: true
    },
    {
        nome: 'Cristina',
        // User wrote 'extcristina.mv@hmail.com', likely hotmail.
        email: 'extcristina.mv@hotmail.com',
        password: '10042012',
        isAdmin: false
    },
    {
        nome: 'Harisson',
        email: 'harissonadv@hotmail.com',
        password: '856281',
        isAdmin: false
    }
];

const enforce = async () => {
    try {
        console.log('--- Enforcing User List ---');

        // 1. Delete users NOT in the list
        const emails = usersToEnforce.map(u => u.email);
        const { Op } = require('sequelize');

        // Find users to delete
        const usersToDelete = await Usuario.findAll({
            where: {
                email: { [Op.notIn]: emails }
            }
        });

        if (usersToDelete.length > 0) {
            console.log(`Deleting ${usersToDelete.length} unauthorized users...`);
            await Usuario.destroy({
                where: {
                    email: { [Op.notIn]: emails }
                }
            });
        }

        // 2. Upsert Enforced Users
        for (const u of usersToEnforce) {
            const existing = await Usuario.findOne({ where: { email: u.email } });
            const password_hash = await bcrypt.hash(u.password, 10);

            if (existing) {
                console.log(`Updating user: ${u.nome} (${u.email})`);
                existing.nome = u.nome;
                existing.password_hash = password_hash;
                existing.isAdmin = u.isAdmin;
                existing.isVerified = true; // Auto verify
                existing.activationToken = null;
                await existing.save();
            } else {
                console.log(`Creating user: ${u.nome} (${u.email})`);
                await Usuario.create({
                    nome: u.nome,
                    email: u.email,
                    password_hash: password_hash,
                    isAdmin: u.isAdmin,
                    isVerified: true,
                    isBanned: false
                });
            }
        }

        console.log('--- Done ---');
        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

enforce();
