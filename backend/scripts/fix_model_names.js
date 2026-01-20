const { sequelize, Modelo } = require('../models');

const fixModelNames = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const modelos = await Modelo.findAll();

        console.log(`Checking ${modelos.length} models...`);
        let count = 0;

        for (const mod of modelos) {
            // Check if name ends with 4 digits (year)
            // Pattern: space + 4 digits + end of string
            const regex = /\s\d{4}$/;
            if (regex.test(mod.nome)) {
                const oldName = mod.nome;
                const newName = mod.nome.replace(regex, ''); // Remove the year

                await mod.update({ nome: newName });
                console.log(`Updated: "${oldName}" -> "${newName}"`);
                count++;
            }
        }

        console.log(`Finished! Updated ${count} models.`);
        process.exit(0);

    } catch (error) {
        console.error('Error fixing models:', error);
        process.exit(1);
    }
};

fixModelNames();
