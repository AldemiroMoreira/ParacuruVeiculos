const axios = require('axios');
const fs = require('fs');

const ML_API_URL = 'https://api.mercadolibre.com';
const QUERY = 'acessorios automotivos';

async function fetchAds() {
    console.log(`[Local Bot] Fetching ads for "${QUERY}" from YOUR internet connection...`);

    try {
        const response = await axios.get(`${ML_API_URL}/sites/MLB/search`, {
            params: {
                q: QUERY,
                limit: 30,
                sort: 'relevance'
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                'Referer': 'https://www.mercadolivre.com.br/',
                'Connection': 'keep-alive'
            }
        });

        const items = response.data.results;
        console.log(`[Local Bot] Found ${items.length} items!`);

        const refinedAds = items.map(item => ({
            titulo: (item.title || 'Produto sem título').substring(0, 255),
            imagem_url: (item.thumbnail || '').replace('http://', 'https://'),
            link_destino: item.permalink,
            localizacao: 'sidebar',
            ativo: true
        }));

        fs.writeFileSync('ads_dump.json', JSON.stringify(refinedAds, null, 2));
        console.log('[Local Bot] Saved ads to "ads_dump.json". Ready for upload!');

    } catch (error) {
        console.error('[Local Bot] Error:', error.message);
        if (error.response) console.error(error.response.data);
    }
}

fetchAds();
