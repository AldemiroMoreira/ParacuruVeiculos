const { Usuario } = require('./models');

async function deleteTestUser() {
    try {
        const email = 'tcristina.mv@gmail.com';
        const deleted = await Usuario.destroy({ where: { email } });
        if (deleted) {
            console.log(`Usuário ${email} deletado com sucesso.`);
        } else {
            console.log(`Usuário ${email} não encontrado.`);
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

deleteTestUser();
