const sequelize = require('./config/database');
const { QueryTypes } = require('sequelize');

const email = 'aldemiro.moreira@gmail.com';

(async () => {
    try {
        await sequelize.authenticate();

        const users = await sequelize.query(
            "SELECT resetPasswordToken FROM users WHERE email = :email",
            {
                replacements: { email },
                type: QueryTypes.SELECT
            }
        );

        if (users.length > 0 && users[0].resetPasswordToken) {
            const token = users[0].resetPasswordToken;
            console.log('TOKEN_LENGTH:', token.length);
            console.log('TOKEN_VALUE:', token);
        } else {
            console.log('Usuário não encontrado ou sem token de recuperação ativo.');
        }

    } catch (error) {
        console.error('Erro:', error);
    } finally {
        await sequelize.close();
    }
})();
