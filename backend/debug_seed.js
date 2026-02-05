const { Fabricante, Modelo, Categoria } = require('./models');
const sequelize = require('./config/database');

async function test() {
    try {
        console.log('>>> DEBUG SEED STARTED');
        await sequelize.authenticate();

        console.log('>>> Cleaning tables...');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        await Modelo.truncate({ cascade: true });
        await Fabricante.truncate({ cascade: true });
        await Categoria.truncate({ cascade: true });
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('>>> Inserting Category 7 (Outros)...');
        await Categoria.create({ id: 7, nome: 'Outros' });

        console.log('>>> Inserting Fabricante 49 (Schaefer)...');
        await Fabricante.create({ id: 49, nome: 'Schaefer Yachts' });

        const cat = await Categoria.findByPk(7);
        console.log('>>> Cat 7 in DB:', JSON.stringify(cat));

        const fab = await Fabricante.findByPk(49);
        console.log('>>> Fab 49 in DB:', JSON.stringify(fab));

        console.log('>>> Inserting Modelo (Schaefer 660)...');
        await Modelo.create({
            id: 351,
            fabricante_id: 49,
            categoria_id: 7,
            nome: 'Schaefer 660'
        });

        console.log('>>> SUCESSO! Modelo inserido.');
    } catch (error) {
        console.error('>>> ERRO FATAL:', error);
    } finally {
        process.exit();
    }
}

test();
