const { State, City } = require('./models');
const sequelize = require('./config/database');

(async () => {
    try {
        await sequelize.authenticate();

        console.log('--- AUDITORIA DE LOCALIDADES ---');

        // State Model uses 'name' and 'abbreviation' (mapped to 'uf')
        const states = await State.findAll();
        console.log(`TOTAL ESTADOS: ${states.length}`);

        if (states.length === 0) {
            console.log('CRÍTICO: Tabela de Estados está vazia!');
        } else {
            // Show first 5 states as sample
            states.slice(0, 5).forEach(s => console.log(`[${s.abbreviation}] ${s.name}`));
        }

        const citiesCount = await City.count();
        console.log(`TOTAL CIDADES: ${citiesCount}`);

        if (states.length > 0) {
            // Check specific state (e.g., Ceará - CE)
            // City model uses 'uf' to link to state
            const ce = states.find(s => s.abbreviation === 'CE');
            if (ce) {
                const ceCities = await City.count({ where: { uf: ce.abbreviation } });
                console.log(`Cidades no Ceará (CE): ${ceCities} (Esperado: > 100)`);
            } else {
                console.log('AVISO: Estado CE não encontrado na lista.');
            }
        }

    } catch (e) {
        console.error('ERROR:', e.message);
    }
    process.exit(0);
})();
