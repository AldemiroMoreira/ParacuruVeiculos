const fetch = require('node-fetch'); // Or native fetch if node 18+
const myFetch = global.fetch || fetch;
const BASE_URL = 'https://www.paracuruveiculos.com.br';

async function checkDependencies() {
    console.log(`\n--- Checking CreateAdPage Dependencies: ${BASE_URL} ---\n`);

    const checks = [
        { name: 'States', url: '/api/locations/states' },
        { name: 'Categories', url: '/api/resources/categorias' },
        { name: 'Fabricantes', url: '/api/resources/fabricantes' },
        { name: 'Plans', url: '/api/resources/planos' } // Verified in CreateAdPage source: /resources/planos
    ];

    for (const check of checks) {
        try {
            const res = await myFetch(`${BASE_URL}${check.url}`);
            if (res.ok) {
                const data = await res.json();
                console.log(`✅ ${check.name}: OK (${Array.isArray(data) ? data.length + ' items' : 'Object'})`);
                if (Array.isArray(data) && data.length === 0) {
                    console.warn(`   ⚠️  ${check.name} returned empty array!`);
                }
            } else {
                console.error(`❌ ${check.name}: Failed (${res.status})`);
            }
        } catch (error) {
            console.error(`❌ ${check.name}: Error (${error.message})`);
        }
    }
}

checkDependencies();
