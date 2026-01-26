const fetch = require('node-fetch'); // Check if available or use built-in if Node 18+
const http = require('http');

// Helper to make requests since node-fetch might not be installed or we want zero-deps
const request = (method, path, data = null, token = null) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3003,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`; // Assuming Bearer, though frontend uses localstorage and maybe no header or custom?
            // Checking frontend: It sends no auth header in fetch calls inside useEffect! 
            // Wait, let me check the frontend code again.
            // CategoriasCrudPage.js:
            // const token = localStorage.getItem('admin_token');
            // if (!token) navigateTo...
            // fetch('/api/db_crud/categorias');
            // It does NOT send the token in the headers in the viewed code!
            // Backend adminRoutes.js:
            // router.get('/categorias', ...) -> No middleware checking token?
            // "Middleware to check specific secret... For MVP... trust the frontend... or just trust the frontend for now"
            // So currently backend has NO auth check on GET/POST routes except the login route itself returning a token.
            // This confirms what I saw in code.
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        resolve(body);
                    }
                } else {
                    reject(`Request failed: ${res.statusCode} ${body}`);
                }
            });
        });

        req.on('error', (e) => reject(e));
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
};

(async () => {
    try {
        console.log('1. Testing Login...');
        const loginRes = await request('POST', '/api/db_crud/login', { password: 'admin123' });
        if (loginRes.success) {
            console.log('   Login Successful. Token:', loginRes.token);
        } else {
            console.error('   Login Failed:', loginRes);
            process.exit(1);
        }

        console.log('2. Testing Categories...');
        const cats = await request('GET', '/api/db_crud/categorias');
        console.log(`   Fetched ${cats.length} categories.`);

        console.log('3. Testing Plans...');
        const plans = await request('GET', '/api/db_crud/planos');
        console.log(`   Fetched ${plans.length} plans.`);

        console.log('4. Testing Manufacturers...');
        const fabs = await request('GET', '/api/db_crud/fabricantes');
        console.log(`   Fetched ${fabs.length} manufacturers.`);

        console.log('5. Testing Models...');
        const mods = await request('GET', '/api/db_crud/modelos');
        console.log(`   Fetched ${mods.length} models.`);

        console.log('Verification Complete: API is responding correctly.');

    } catch (err) {
        console.error('Verification Failed:', err);
    }
})();
