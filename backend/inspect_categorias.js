const { Categoria } = require('./models');

async function listCategorias() {
    try {
        const cats = await Categoria.findAll();
        console.log('--- Categorias Atuais ---');
        cats.forEach(c => console.log(`ID: ${c.id}, Nome: "${c.nome}"`));
        console.log('-------------------------');
    } catch (error) {
        console.error('Erro:', error);
    }
}

listCategorias();
