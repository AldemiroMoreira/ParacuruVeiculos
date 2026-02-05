const fs = require('fs');
const { Propaganda } = require('../backend/models');

async function importAds() {
    try {
        console.log('[Importer] Reading ads_dump.json...');

        if (!fs.existsSync('ads_dump.json')) {
            console.error('File ads_dump.json not found!');
            return;
        }

        const rawData = fs.readFileSync('ads_dump.json');
        let data = JSON.parse(rawData);

        // Handle Raw API response (object with results array)
        let items = [];
        if (data.results && Array.isArray(data.results)) {
            items = data.results;
        } else if (Array.isArray(data)) {
            items = data;
        }

        console.log(`[Importer] Found ${items.length} items to process.`);

        // Clear sidebars
        await Propaganda.destroy({ where: { localizacao: 'sidebar' } });

        let count = 0;
        for (const item of items) {
            // Map fields if necessary (Raw API vs Pre-processed)
            const titulo = item.titulo || item.title || 'Produto sem título';
            const imagem = (item.imagem_url || item.thumbnail || '').replace('http://', 'https://');
            const link = item.link_destino || item.permalink;

            if (!link) continue;

            await Propaganda.create({
                titulo: titulo.substring(0, 255),
                imagem_url: imagem,
                link_destino: link,
                preco: item.preco || null,
                descricao: item.descricao || '',
                localizacao: 'sidebar',
                ativo: true
            });
            count++;
        }

        console.log(`[Importer] Successfully imported ${count} ads!`);

    } catch (error) {
        console.error('[Importer] Error:', error);
    }
}

importAds();
