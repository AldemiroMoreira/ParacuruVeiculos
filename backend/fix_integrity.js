const { Anuncio } = require('./models');

async function fixIntegrity() {
    console.log('--- Corrigindo Integridade ---');

    try {
        // Fix Anuncios with null category_id
        // We will set them to 'Outros' (assuming ID 9 based on previous output, but let's fetch 'Outros' or default to 9)
        // Actually, let's hardcode 9 for now as seen in inspecting_categorias.js output: ID: 9, Nome: "Outros"
        const OUTROS_ID = 9;

        const [updatedCount] = await Anuncio.update(
            { categoria_id: OUTROS_ID },
            { where: { categoria_id: null } }
        );

        console.log(`Anúncios corrigidos (Categoria NULL -> ${OUTROS_ID}): ${updatedCount}`);

    } catch (error) {
        console.error('Erro ao corrigir:', error);
    }
}

fixIntegrity();
