const fs = require('fs');
const { Categoria } = require('./models');

async function check() {
    try {
        const cats = await Categoria.findAll();
        const content = cats.map(c => `ID: ${c.id}, Nome: ${c.nome}`).join('\n');
        fs.writeFileSync('categories_check.txt', content);
        console.log('Written to categories_check.txt');
    } catch (e) {
        console.error(e);
    }
}

check();
