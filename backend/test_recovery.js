const axios = require('axios');
const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function test() {
    // 1. Get a user email from DB
    const sequelize = require('./config/database');
    console.log('Sequelize instance:', sequelize);
    console.log('Sequelize query method:', sequelize ? sequelize.query : 'undefined');

    try {
        const [results] = await sequelize.query("SELECT email FROM users LIMIT 1");
        if (results.length === 0) {
            console.log('No users found to test with.');
            return;
        }
        const email = results[0].email;
        console.log(`Testing recovery for email: ${email}`);

        // 2. Call API
        try {
            const response = await axios.post('http://localhost:3000/api/auth/forgot-password', { email });
            console.log('API Response:', response.status, response.data);
        } catch (apiError) {
            console.error('API Error:', apiError.response ? apiError.response.data : apiError.message);
        }

    } catch (err) {
        console.error('DB Error:', err);
    } finally {
        await sequelize.close();
    }
}

test();
