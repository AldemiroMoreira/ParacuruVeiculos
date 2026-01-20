const sequelize = require('./backend/config/database');

async function fixUsersTable() {
    try {
        console.log('Verificando tabela usuarios...');

        // Adicionar resetPasswordToken se não existir
        try {
            await sequelize.query("ALTER TABLE usuarios ADD COLUMN resetPasswordToken VARCHAR(255) NULL;");
            console.log('Coluna resetPasswordToken adicionada.');
        } catch (error) {
            if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
                console.log('Coluna resetPasswordToken já existe.');
            } else {
                console.error('Erro ao adicionar resetPasswordToken:', error.message);
            }
        }

        // Adicionar resetPasswordExpires se não existir
        try {
            await sequelize.query("ALTER TABLE usuarios ADD COLUMN resetPasswordExpires DATETIME NULL;");
            console.log('Coluna resetPasswordExpires adicionada.');
        } catch (error) {
            if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
                console.log('Coluna resetPasswordExpires já existe.');
            } else {
                console.error('Erro ao adicionar resetPasswordExpires:', error.message);
            }
        }

        console.log('Verificação concluída.');
    } catch (error) {
        console.error('Erro geral:', error);
    } finally {
        await sequelize.close();
    }
}

fixUsersTable();
