const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const baseURL = 'http://localhost:3000/api';

async function testCreateAd() {
    try {
        // 1. Authenticate (using a known test user or creating one)
        // Let's try to login first. Adjust credentials as needed for testing.
        let token;
        try {
            const loginRes = await axios.post(`${baseURL}/auth/login`, {
                email: 'test@example.com',
                password: 'password123'
            });
            token = loginRes.data.token;
            console.log('Login successful.');
        } catch (e) {
            console.log('Login failed, trying to register...');
            try {
                const regRes = await axios.post(`${baseURL}/auth/register`, {
                    nome: 'Test User',
                    email: 'test@example.com',
                    password: 'password123'
                });
                console.log('Registration successful.');
                // Login again
                const loginRes = await axios.post(`${baseURL}/auth/login`, {
                    email: 'test@example.com',
                    password: 'password123'
                });
                token = loginRes.data.token;
            } catch (regErr) {
                console.error('Registration/Login failed:', regErr.response?.data || regErr.message);
                return;
            }
        }

        // 2. Prepare Form Data
        const form = new FormData();
        form.append('titulo', 'Teste Automatizado');
        form.append('descricao', 'Descrição de teste');
        form.append('preco', '50000');
        form.append('ano_fabricacao', '2022');
        form.append('km', '10000');

        // Need valid IDs from database. Since we just populated, let's guess or fetch.
        // Let's fetch manufacturers first to get valid IDs.
        const fabRes = await axios.get(`${baseURL}/resources/fabricantes`);
        const fabricante = fabRes.data.find(f => f.nome === 'Toyota');
        if (!fabricante) throw new Error('Fabricante Toyota not found');

        form.append('fabricante_id', fabricante.id);

        const modRes = await axios.get(`${baseURL}/resources/modelos/${fabricante.id}`);
        const modelo = modRes.data[0];
        if (!modelo) throw new Error('No models found for Toyota');

        form.append('modelo_id', modelo.id);

        // Locations
        const statesRes = await axios.get(`${baseURL}/locations/states`);
        const state = statesRes.data.find(s => s.abbreviation === 'CE'); // Assuming CE exists
        if (!state) throw new Error('State CE not found');
        form.append('estado_id', state.abbreviation); // API expects abbreviation for fetching cities, but what does Create expect?
        // CreateAdPage.js: setFormData(prev => ({ ...prev, estado_id: stateId... 
        // handleStateChange sets statusId = e.target.value (which is abbreviation from option value).
        // BUT models/Anuncio.js says estado_id.
        // wait, Anuncio model usually expects ID if foreign key? 
        // In previous layout Step 1143: Anuncio.belongsTo(State, { foreignKey: 'estado_id', targetKey: 'abbreviation' });
        // So sending abbreviation ('CE') is CORRECT if targetKey is abbreviation.

        const citiesRes = await axios.get(`${baseURL}/locations/cities/${state.abbreviation}`);
        const city = citiesRes.data[0];
        if (!city) throw new Error('No cities for CE');
        form.append('cidade_id', city.id);

        form.append('plan_id', '1');

        // 3. Create Dummy Image
        const dummyImgPath = path.join(__dirname, 'test_image.jpg');
        if (!fs.existsSync(dummyImgPath)) {
            fs.writeFileSync(dummyImgPath, 'fake image content');
        }
        // Note: 'fake image content' might fail image validation if it checks magic numbers.
        // Let's rely on the imageValidator mock returning true for now, or use a real header if possible.
        // The current imageValidator (Step 1105) just logs and returns true after timeout. So fake content is fine.
        form.append('images', fs.createReadStream(dummyImgPath));

        // 4. Send Request
        console.log('Sending Create Ad Request...');
        const response = await axios.post(`${baseURL}/anuncios`, form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('SUCCESS! Ad created:', response.data);

    } catch (error) {
        console.error('ERROR Test Failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

testCreateAd();
