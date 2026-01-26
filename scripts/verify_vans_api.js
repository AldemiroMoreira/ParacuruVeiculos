const http = require('http');

const request = (path) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '127.0.0.1',
            port: 3003,
            path: path,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try { resolve(JSON.parse(body)); } catch (e) { resolve(body); }
                } else { reject(`Failed: ${res.statusCode}`); }
            });
        });
        req.on('error', reject);
        req.end();
    });
};

(async () => {
    try {
        console.log('Fetching Categories to find ID for "Van/Utilitário"...');
        const cats = await request('/api/resources/categorias');
        const vanCat = cats.find(c => c.nome === 'Van/Utilitário' || c.nome === 'Vans/Utilitários');

        if (!vanCat) {
            console.error('Category NOT FOUND!');
            return;
        }
        console.log(`Category ID: ${vanCat.id}`);

        console.log(`Fetching Manufacturers for Category ID ${vanCat.id}...`);
        const fabs = await request(`/api/resources/fabricantes?categoriaId=${vanCat.id}`);

        console.log(`Found ${fabs.length} manufacturers:`);
        fabs.forEach(f => console.log(` - ${f.nome}`));

    } catch (e) {
        console.error(e);
    }
})();
