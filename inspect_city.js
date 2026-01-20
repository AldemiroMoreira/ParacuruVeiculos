const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'database/municipios.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const city = jsonData.find(c => c.id === 5101837);
console.log(JSON.stringify(city, null, 2));
