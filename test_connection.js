const axios = require('axios');

async function testLogin() {
    try {
        console.log('Attempting to connect to http://localhost:3000/api/auth/login...');
        const response = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'bernadosousa@hotmail.com',
            password: '012345' // Expecting 404 or 401, but NOT network error
        });
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        if (response.data.user) {
            console.log('User found:', response.data.user.name);
        }
    } catch (error) {
        if (error.response) {
            console.log('Server responded with status:', error.response.status);
            console.log('Data:', error.response.data);
        } else if (error.request) {
            console.log('No response received (Network Error). check if server is running on port 3000.');
            console.log(error.message);
        } else {
            console.log('Error setting up request:', error.message);
        }
    }
}

testLogin();
