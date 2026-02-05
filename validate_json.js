const fs = require('fs');
const path = require('path');

const load = (name) => JSON.parse(fs.readFileSync(path.join(__dirname, 'database', name), 'utf-8'));

const fabricantes = load('fabricantes.json');
const modelos = load('modelos.json');

const fabIds = new Set(fabricantes.map(f => f.id));
const catIds = new Set([1, 2, 3, 4, 5, 6, 7]);

console.log(`Loaded ${fabricantes.length} fabricantes and ${modelos.length} modelos.`);

let errors = 0;
modelos.forEach(m => {
    if (!fabIds.has(m.fabricante_id)) {
        console.error(`Modelo ${m.id} (${m.nome}) references missing fabricante_id: ${m.fabricante_id}`);
        errors++;
    }
    if (m.categoria_id && !catIds.has(m.categoria_id)) {
        console.error(`Modelo ${m.id} (${m.nome}) references invalid categoria_id: ${m.categoria_id}`);
        errors++;
    }
});

if (errors === 0) {
    console.log('✅ Integrity Check Passed: All references in modelos.json are valid.');
} else {
    console.log(`❌ Found ${errors} integrity errors.`);
    process.exit(1);
}
