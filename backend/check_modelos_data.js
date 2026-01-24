const { Modelo } = require('./models');

async function check() {
    try {
        const modelos = await Modelo.findAll({ limit: 10 });
        console.log('--- Top 10 Modelos ---');
        modelos.forEach(m => {
            console.log(`ID: ${m.id}, Nome: ${m.nome}, FabID: ${m.fabricante_id}, CatID: ${m.categoria_id}, EspID: ${m.dataValues.especie_id}`);
        });
    } catch (error) {
        console.error(error);
    }
}

check();
