const { Categoria, Fabricante, Modelo } = require('./backend/models');
const sequelize = require('./backend/config/database');

async function check() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');
        const cats = await Categoria.count();
        console.log(`Categorias: ${cats}`);

        const fabs = await Fabricante.count();
        console.log(`Fabricantes: ${fabs}`);

        const mods = await Modelo.count();
        console.log(`Modelos: ${mods}`);

    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}
check();
