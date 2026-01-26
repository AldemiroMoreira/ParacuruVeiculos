const fetch = require('node-fetch');
const myFetch = global.fetch || fetch;
const BASE_URL = 'https://www.paracuruveiculos.com.br';

async function diagnoseRenderData() {
    console.log(`\n--- Diagnosing Render Data for CreateAdPage ---\n`);

    try {
        const [states, cats, fabs, plans] = await Promise.all([
            myFetch(`${BASE_URL}/api/locations/states`).then(r => r.json()),
            myFetch(`${BASE_URL}/api/resources/categorias`).then(r => r.json()),
            myFetch(`${BASE_URL}/api/resources/fabricantes`).then(r => r.json()),
            myFetch(`${BASE_URL}/api/resources/planos`).then(r => r.json())
        ]);

        console.log('✅ Data Fetched Successfully');

        // Check for null/undefined that might crash .map()
        console.log(`States Array? ${Array.isArray(states)} (Length: ${states?.length})`);
        console.log(`Categories Array? ${Array.isArray(cats)} (Length: ${cats?.length})`);
        console.log(`Fabricantes Array? ${Array.isArray(fabs)} (Length: ${fabs?.length})`);
        console.log(`Plans Array? ${Array.isArray(plans)} (Length: ${plans?.length})`);

        // Check structure of first item in each
        console.log('\n--- Data Structures (First Item) ---');
        console.log('State:', states[0]);
        console.log('Category:', cats[0]);
        console.log('Manufacturer:', fabs[0]);
        console.log('Plan:', plans[0]);

        // Simulating the exact maps used in JSX
        console.log('\n--- Simulating JSX Maps ---');
        try {
            states.map(state => state.abbreviation + state.name);
            console.log('✅ States map OK');
        } catch (e) { console.error('❌ States map FAILED:', e.message); }

        try {
            cats.map(e => e.id + e.nome);
            console.log('✅ Categories map OK');
        } catch (e) { console.error('❌ Categories map FAILED:', e.message); }

        try {
            fabs.map(f => f.id + f.nome);
            console.log('✅ Fabricantes map OK');
        } catch (e) { console.error('❌ Fabricantes map FAILED:', e.message); }

        try {
            plans.map(p => p.id + p.nome + p.duracao_dias + p.preco);
            console.log('✅ Plans map OK');
        } catch (e) { console.error('❌ Plans map FAILED:', e.message); }

    } catch (error) {
        console.error('❌ Diagnosis Fatal Error:', error);
    }
}

diagnoseRenderData();
