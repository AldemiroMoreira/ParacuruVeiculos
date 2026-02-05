const axios = require('axios');

async function testML() {
    try {
        console.log("Fetching trends...");
        // Search for "Acessórios para Veículos" (MLB5672)
        // Using User-Agent to identify the request
        const response = await axios.get('https://api.mercadolibre.com/sites/MLB/search', {
            headers: {
                'User-Agent': 'ParacuruVeiculos/1.0 (aldemiro.moreira@gmail.com)'
            },
            params: {
                category: 'MLB5672',
                sort: 'relevance',
                limit: 5
            }
        });

        const results = response.data.results;
        console.log(`Found ${results.length} items.`);

        results.forEach(item => {
            console.log('---');
            console.log('Title:', item.title);
            console.log('Price:', item.price);
            console.log('Link:', item.permalink);
        });

    } catch (error) {
        if (error.response) {
            console.error('API Error:', error.response.status, error.response.statusText);
        } else {
            console.error('API Error:', error.message);
        }
    }
}

testML();
