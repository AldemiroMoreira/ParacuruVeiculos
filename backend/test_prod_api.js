const fetch = require('node-fetch'); // Or native fetch if node 18+
const myFetch = global.fetch || fetch;
const BASE_URL = 'https://www.paracuruveiculos.com.br';

async function test() {
    console.log(`\n--- Verifying Production: ${BASE_URL} ---\n`);

    try {
        // Login
        const loginRes = await myFetch(`${BASE_URL}/api/db_crud/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: 'admin123' })
        });
        const loginData = await loginRes.json();

        if (!loginData.success) {
            console.error('❌ Login Failed:', loginData.message);
            return;
        }
        console.log('✅ Admin Login Successful');

        // Categories
        const catRes = await myFetch(`${BASE_URL}/api/db_crud/categorias`);
        const catData = await catRes.json();
        console.log(`\n📂 Categories (${catData.length}):`);
        console.table(catData); // Console table is nice if supported, otherwise just object

        // Plans
        const planRes = await myFetch(`${BASE_URL}/api/db_crud/plans`) // Note: Route might be 'planos' or 'plans' - Checking previous file it was 'planos'
            .catch(async () => await myFetch(`${BASE_URL}/api/db_crud/planos`));

        // Let's force 'planos' based on adminRoutes.js
        const planResCorrect = await myFetch(`${BASE_URL}/api/db_crud/planos`);

        if (planResCorrect.ok) {
            const planData = await planResCorrect.json();
            console.log(`\n📋 Plans (${planData.length}):`);
            // Map for cleaner output
            const plansClean = planData.map(p => ({
                id: p.id,
                nome: p.nome,
                dias: p.duracao_dias,
                preco: `R$ ${p.preco}`
            }));
            console.log(JSON.stringify(plansClean, null, 2));
        } else {
            console.error(`❌ Failed to fetch plans: ${planResCorrect.status}`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

test();
