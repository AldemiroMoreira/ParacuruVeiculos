const { Anuncio, Modelo, Fabricante, Categoria, Usuario } = require('./models');

async function checkIntegrity() {
    console.log('--- Iniciando Verificação de Integridade ---');

    try {
        // 1. Check Modelos without valid Categoria
        const modelos = await Modelo.findAll();
        const categoriaIds = (await Categoria.findAll()).map(c => c.id);
        const badModelos = modelos.filter(m => !categoriaIds.includes(m.categoria_id));

        console.log(`\nModelos: ${modelos.length} total.`);
        if (badModelos.length > 0) {
            console.log(`[ALERTA] ${badModelos.length} modelos com categoria_id inválido/inexistente.`);
            badModelos.forEach(m => console.log(` - Modelo ID ${m.id} (${m.nome}) -> CatID: ${m.categoria_id}`));
        } else {
            console.log('[OK] Todos os modelos têm categorias válidas.');
        }

        // 2. Check Anuncios without valid Categoria
        const anuncios = await Anuncio.findAll();
        const badAnunciosCat = anuncios.filter(a => !categoriaIds.includes(a.categoria_id));

        console.log(`\nAnúncios: ${anuncios.length} total.`);
        if (badAnunciosCat.length > 0) {
            console.log(`[ALERTA] ${badAnunciosCat.length} anúncios com categoria_id inválido.`);
            badAnunciosCat.forEach(a => console.log(` - Anuncio ID ${a.id} -> CatID: ${a.categoria_id}`));
        } else {
            console.log('[OK] Todos os anúncios têm categorias válidas.');
        }

        // 3. Check Anuncios without valid Modelo
        const modeloIds = modelos.map(m => m.id);
        const badAnunciosModelo = anuncios.filter(a => !modeloIds.includes(a.modelo_id));

        if (badAnunciosModelo.length > 0) {
            console.log(`[ALERTA] ${badAnunciosModelo.length} anúncios com modelo_id inválido.`);
            badAnunciosModelo.forEach(a => console.log(` - Anuncio ID ${a.id} -> ModeloID: ${a.modelo_id}`));
        } else {
            console.log('[OK] Todos os anúncios têm modelos válidos.');
        }

        // 4. Check Anuncios without valid Fabricante
        const fabricantes = await Fabricante.findAll();
        const fabIds = fabricantes.map(f => f.id);
        const badAnunciosFab = anuncios.filter(a => !fabIds.includes(a.fabricante_id));

        if (badAnunciosFab.length > 0) {
            console.log(`[ALERTA] ${badAnunciosFab.length} anúncios com fabricante_id inválido.`);
            badAnunciosFab.forEach(a => console.log(` - Anuncio ID ${a.id} -> FabID: ${a.fabricante_id}`));
        } else {
            console.log('[OK] Todos os anúncios têm fabricantes válidos.');
        }

        // 5. Check Anuncios without valid Usuario (Owner)
        const usuarios = await Usuario.findAll();
        const userIds = usuarios.map(u => u.id);
        const badAnunciosUser = anuncios.filter(a => !userIds.includes(a.usuario_id));

        if (badAnunciosUser.length > 0) {
            console.log(`[ALERTA] ${badAnunciosUser.length} anúncios com usuario_id (dono) inválido.`);
            badAnunciosUser.forEach(a => console.log(` - Anuncio ID ${a.id} -> UserID: ${a.usuario_id}`));
        } else {
            console.log('[OK] Todos os anúncios têm proprietários válidos.');
        }

    } catch (error) {
        console.error('Erro na verificação:', error);
    }
    console.log('\n--- Fim da Verificação ---');
}

checkIntegrity();
