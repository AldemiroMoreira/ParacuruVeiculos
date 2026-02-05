const { Usuario } = require('./models');
async function check() {
    try {
        const u = await Usuario.findOne({ where: { email: 'aldemiro.moreira@gmail.com' } });
        console.log('USER_CHECK:', JSON.stringify(u, null, 2));
    } catch (e) { console.error(e); }
}
check();
