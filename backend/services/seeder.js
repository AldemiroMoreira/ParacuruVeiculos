const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { Fabricante, Modelo, State: Estado, City: Cidade, Plano, Usuario, Categoria } = require('../models');
const sequelize = require('../config/database');

// Load JSON data
const loadData = () => {
    return {
        fabricantesData: JSON.parse(fs.readFileSync(path.join(__dirname, '../../database/fabricantes.json'), 'utf-8')),
        modelosData: JSON.parse(fs.readFileSync(path.join(__dirname, '../../database/modelos.json'), 'utf-8')),
        estadosData: JSON.parse(fs.readFileSync(path.join(__dirname, '../../database/estados.json'), 'utf-8')),
        municipiosData: JSON.parse(fs.readFileSync(path.join(__dirname, '../../database/municipios.json'), 'utf-8'))
    };
};

const runSeed = async () => {
    // 0. Clean up (Truncate) to ensure IDs match JSON
    console.log('Cleaning up old data...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
    await Modelo.truncate({ cascade: true, restartIdentity: true }); // Restart IDs
    await Fabricante.truncate({ cascade: true, restartIdentity: true });
    await Categoria.truncate({ cascade: true, restartIdentity: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });

    // 1. Categorias
    console.log('Seeding Categorias...');
    const categorias = [
        { id: 1, nome: 'Carro' },
        { id: 2, nome: 'Moto' },
        { id: 3, nome: 'Caminhão' },
        { id: 4, nome: 'Van/Utilitário' },
        { id: 5, nome: 'Barco' },
        { id: 6, nome: 'Aeronave' },
        { id: 7, nome: 'Outros' }
    ];
    // Using explicit create loop to ensure IDs are respected
    for (const cat of categorias) {
        await Categoria.create(cat);
    }

    // VERIFICACAO DE DEBUG
    const verifyCats = await Categoria.findAll({ attributes: ['id', 'nome'] });
    console.log('>>> VERIFICACAO DE CATEGORIAS:', JSON.stringify(verifyCats, null, 2));

    // Load Data
    const { fabricantesData, modelosData, estadosData, municipiosData } = loadData();

    // 2. Fabricantes
    console.log('Seeding Fabricantes...');
    // Ensure Fabricantes are sorted by ID to avoid gaps if possible, though upsert handles it
    // Ensure Fabricantes are sorted by ID to avoid gaps if possible
    for (const fab of fabricantesData) {
        await Fabricante.create({ id: fab.id, nome: fab.nome });
    }

    // VERIFICACAO DE FABRICANTE 49
    const fab49 = await Fabricante.findByPk(49);
    console.log('>>> VERIFICACAO FABRICANTE 49:', fab49 ? 'ENCONTRADO' : 'NAO ENCONTRADO');

    // 3. Modelos
    console.log('Seeding Modelos...');
    const chunkSize = 50;
    for (let i = 0; i < modelosData.length; i += chunkSize) {
        const chunk = modelosData.slice(i, i + chunkSize);
        await Modelo.bulkCreate(chunk, { updateOnDuplicate: ['nome', 'fabricante_id', 'categoria_id'] });
    }

    // 4. Estados
    console.log('Seeding Estados...');
    const estados = estadosData.map(e => ({ abbreviation: e.sigla, name: e.nome }));
    await Estado.bulkCreate(estados, { updateOnDuplicate: ['name'] });

    // 5. Cidades
    console.log('Seeding Cidades...');
    const cidades = municipiosData.map(m => {
        let uf = null;
        if (m.microrregiao && m.microrregiao.mesorregiao && m.microrregiao.mesorregiao.UF) {
            uf = m.microrregiao.mesorregiao.UF.sigla;
        } else if (m['regiao-imediata'] && m['regiao-imediata']['regiao-intermediaria'] && m['regiao-imediata']['regiao-intermediaria'].UF) {
            uf = m['regiao-imediata']['regiao-intermediaria'].UF.sigla;
        }
        if (!uf) return null;
        return { id: m.id, nome: m.nome, uf: uf };
    }).filter(c => c !== null);

    for (let i = 0; i < cidades.length; i += 1000) {
        const chunk = cidades.slice(i, i + 1000);
        await Cidade.bulkCreate(chunk, { ignoreDuplicates: true });
    }

    // 6. Planos
    console.log('Seeding Planos...');
    await Plano.findOrCreate({
        where: { nome: 'Teste na produção!' },
        defaults: { duracao_dias: 30, preco: 0.05 }
    });

    // 7. Usuario Cristina
    console.log('Seeding Usuario Cristina...');
    const email = 'tcristina.mv@gmail.com';
    const password = '10042012';
    const hashedPassword = await bcrypt.hash(password, 10);
    const [user, created] = await Usuario.findOrCreate({
        where: { email },
        defaults: { nome: 'Cristina', password_hash: hashedPassword }
    });
    if (!created) {
        user.password_hash = hashedPassword;
        await user.save();
    }

    return { success: true, message: 'Database populated successfully!' };
};

module.exports = { runSeed };
