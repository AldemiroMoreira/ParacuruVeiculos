const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../routes/.env') });

console.log('Testing .env loading from:', path.join(__dirname, '../routes/.env'));
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS:', process.env.DB_PASS ? '****** (Loaded)' : 'NOT LOADED');
console.log('DB_HOST:', process.env.DB_HOST);
