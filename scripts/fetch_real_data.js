const axios = require('axios');
const fs = require('fs');

// The links provided by the user
const LINKS = [
    'https://mercadolivre.com/sec/1YpNoND',
    'https://mercadolivre.com/sec/2WuA69v',
    'https://mercadolivre.com/sec/2Q2b31i',
    'https://mercadolivre.com/sec/1U1oCB2',
    'https://mercadolivre.com/sec/1KLGfYg',
    'https://mercadolivre.com/sec/2X6bw26',
    'https://mercadolivre.com/sec/2w2LxKq',
    'https://mercadolivre.com/sec/21SmTpS',
    'https://mercadolivre.com/sec/2T9yJvu',
    'https://mercadolivre.com/sec/1vdRrsd',
    'https://mercadolivre.com/sec/1HjgXv6',
    'https://mercadolivre.com/sec/1iof18M',
    'https://mercadolivre.com/sec/2q8gmeK'
];

async function fetchRealData() {
    console.log(`[Scraper] Processing ${LINKS.length} links...`);

    const results = [];

    for (const link of LINKS) {
        try {
            console.log(`[Scraper] Visiting: ${link}`);

            // Request with browser-like headers
            const response = await axios.get(link, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                    'Connection': 'keep-alive'
                },
                maxRedirects: 5,
                timeout: 10000
            });

            const html = response.data;

            // Strategy 1: JSON-LD (Best for Price/Description)
            let jsonLdPrice = null;
            let jsonLdDesc = null;
            try {
                const jsonMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
                if (jsonMatch && jsonMatch[1]) {
                    const jsonData = JSON.parse(jsonMatch[1]);
                    // Check if array or object
                    const product = Array.isArray(jsonData) ? jsonData.find(i => i['@type'] === 'Product') : jsonData;

                    if (product) {
                        if (product.offers) {
                            const offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
                            jsonLdPrice = offer.price;
                        }
                        jsonLdDesc = product.description;
                    }
                }
            } catch (e) {
                // ignore json parse error
            }

            // Strategy 2: Meta Tags
            const imgMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
            const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
            const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
            const priceMetaMatch = html.match(/<meta itemprop="price" content="([0-9.]+)"/);

            // Strategy 3: Raw Regex (Fallback)
            const priceRegexMatch = html.match(/"price":([0-9.]+)/);

            const image = imgMatch ? imgMatch[1] : null;
            let title = titleMatch ? titleMatch[1] : 'Produto em Oferta';

            const description = jsonLdDesc || (descMatch ? descMatch[1] : '');
            const price = jsonLdPrice || (priceMetaMatch ? parseFloat(priceMetaMatch[1]) : (priceRegexMatch ? parseFloat(priceRegexMatch[1]) : null));

            // Clean title (remove ML suffix)
            title = title.replace(' | MercadoLivre', '').replace(' | Mercado Livre', '');

            if (image) {
                console.log(`   -> Found: ${title.substring(0, 30)}... | R$ ${price || 'N/A'}`);
                results.push({
                    titulo: title,
                    imagem_url: image,
                    link_destino: link,
                    preco: price,
                    descricao: description,
                    localizacao: 'sidebar',
                    ativo: true
                });
            } else {
                console.warn(`   -> No image found for ${link}`);
            }

            // Politeness delay
            await new Promise(r => setTimeout(r, 1000));

        } catch (error) {
            console.error(`   -> Error fetching ${link}:`, error.message);
        }
    }

    fs.writeFileSync('real_ads.json', JSON.stringify(results, null, 2));
    console.log(`[Scraper] Saved ${results.length} ads to "real_ads.json".`);
}

fetchRealData();
