const fetch = require('node-fetch');
const myFetch = global.fetch || fetch;
const BASE_URL = 'https://www.paracuruveiculos.com.br';

async function checkJeepModels() {
    console.log(`\n--- Checking Jeep Models Availability ---\n`);

    try {
        // 1. Get Manufacturer ID for 'Jeep'
        const fabsRes = await myFetch(`${BASE_URL}/api/resources/fabricantes`);
        const fabs = await fabsRes.json();
        const jeep = fabs.find(f => f.nome.toLowerCase() === 'jeep');

        if (!jeep) {
            console.error('❌ Manufacturer "Jeep" not found in API!');
            return;
        }

        console.log(`✅ Found Jeep ID: ${jeep.id}`);

        // 2. Fetch Models for Jeep
        // Note: HomePage.js logic sends `?categoriaId=${value}` if category is selected.
        // Let's assume Category 'Carro' (usually ID 1) is selected as per screenshot.

        const catsRes = await myFetch(`${BASE_URL}/api/resources/categorias`);
        const cats = await catsRes.json();
        const carro = cats.find(c => c.nome.toLowerCase() === 'carro');
        const carroId = carro ? carro.id : 1;
        console.log(`ℹ️ Testing with Category 'Carro' (ID: ${carroId})`);

        const url = `${BASE_URL}/api/resources/modelos/${jeep.id}?categoriaId=${carroId}`;
        console.log(`Fetching: ${url}`);

        const modelsRes = await myFetch(url);
        if (modelsRes.ok) {
            const models = await modelsRes.json();
            console.log(`\n📦 Models found: ${models.length}`);
            if (models.length > 0) {
                console.table(models);
            } else {
                console.warn('⚠️ No models returned for Jeep!');
            }
        } else {
            const errorText = await modelsRes.text();
            console.error(`❌ Failed to fetch models: ${modelsRes.status}`);
            console.log('FULL_ERROR_START');
            console.log(errorText);
            console.log('FULL_ERROR_END');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkJeepModels();
