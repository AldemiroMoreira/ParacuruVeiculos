const axios = require('axios');

async function testAdminApi() {
    try {
        console.log('1. Attempting Login as Alder...');
        const loginRes = await axios.post('http://127.0.0.1:3003/api/auth/admin/login', {
            username: 'aldemiro.moreira@gmail.com', // AdminPage uses username field
            password: '91254413'
        });

        const token = loginRes.data.token;
        console.log('Login successful. Token obtained.');

        console.log('2. Fetching Users...');
        const usersRes = await axios.get('http://127.0.0.1:3003/api/admin/users', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`Status: ${usersRes.status}`);
        console.log('Users Data:', usersRes.data);

    } catch (error) {
        console.error('Error during test:');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

testAdminApi();
