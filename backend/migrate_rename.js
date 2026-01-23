const sequelize = require('./config/database');

async function migrate() {
    try {
        console.log('Starting migration: Rename Especie -> Categoria...');

        // 1. Rename table 'especie_veiculos' to 'categorias'
        console.log('Renaming table especie_veiculos to categorias...');
        try {
            await sequelize.query("RENAME TABLE especie_veiculos TO categorias;");
            console.log('Table renamed successfully.');
        } catch (error) {
            if (error.original && error.original.code === 'ER_TABLE_EXISTS_ERROR') {
                console.log('Table categorias already exists or especie_veiculos does not. Checking...');
            } else if (error.original && error.original.code === 'ER_NO_SUCH_TABLE') {
                console.log('Source table especie_veiculos does not exist. Maybe already renamed?');
            } else {
                throw error;
            }
        }

        // 2. Rename column 'especie_id' to 'categoria_id' in 'anuncios'
        console.log("Renaming especie_id to categoria_id in 'anuncios'...");
        try {
            // Check if column exists first to avoid error? Or just try change
            await sequelize.query("ALTER TABLE anuncios CHANGE especie_id categoria_id INTEGER;");
            console.log('Column in anuncios updated.');
        } catch (error) {
            if (error.original && error.original.code === 'ER_BAD_FIELD_ERROR') {
                console.log("Column especie_id not found in anuncios. Already renamed?");
            } else {
                throw error;
            }
        }

        // 3. Rename column 'especie_id' to 'categoria_id' in 'modelos'
        console.log("Renaming especie_id to categoria_id in 'modelos'...");
        try {
            await sequelize.query("ALTER TABLE modelos CHANGE especie_id categoria_id INTEGER;");
            console.log('Column in modelos updated.');
        } catch (error) {
            if (error.original && error.original.code === 'ER_BAD_FIELD_ERROR') {
                console.log("Column especie_id not found in modelos. Already renamed?");
            } else {
                throw error;
            }
        }

        console.log('Migration completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
