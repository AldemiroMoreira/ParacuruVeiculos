const sequelize = require('./config/database');
const { EspecieVeiculo } = require('./models');

const migrate = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        // Sync EspecieVeiculo table
        await EspecieVeiculo.sync({ force: true });
        console.log('EspecieVeiculo table created.');

        // Seed data
        const especies = [
            { nome: 'Automóvel' },
            { nome: 'Caminhão' },
            { nome: 'Ônibus' },
            { nome: 'Moto' },
            { nome: 'Barco' },
            { nome: 'Aeronave' }
        ];

        await EspecieVeiculo.bulkCreate(especies);
        console.log('Especies seeded.');

        // Add column to Anuncios if not exists
        try {
            const [results] = await sequelize.query("SHOW COLUMNS FROM anuncios LIKE 'especie_id'");
            if (results.length === 0) {
                await sequelize.query("ALTER TABLE anuncios ADD COLUMN especie_id INTEGER");
                console.log('Added especie_id column to anuncios table.');
            } else {
                console.log('especie_id column already exists in anuncios table.');
            }
        } catch (colError) {
            console.error('Error checking/adding column:', colError);
        }

        console.log('Migration complete.');
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
