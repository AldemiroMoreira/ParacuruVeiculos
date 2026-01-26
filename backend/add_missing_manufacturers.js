const { Fabricante } = require('./models');

const newFabricantes = [
    'Ram',
    'Porsche',
    'Mini',
    'Subaru',
    'Lexus',
    'Jaguar',
    'Bajaj',
    'Avelloz',
    'Zontes',
    'Iveco',
    'Volvo' // Just to be safe, though it was in the list. Uniqueness check handles it.
];

(async () => {
    try {
        console.log('Adding missing manufacturers...');
        for (const nome of newFabricantes) {
            const [fab, created] = await Fabricante.findOrCreate({
                where: { nome },
                defaults: { nome }
            });
            if (created) {
                console.log(`Created: ${nome}`);
            } else {
                console.log(`Already exists: ${nome}`);
            }
        }
        console.log('Done.');
    } catch (e) {
        console.error(e);
    }
})();
