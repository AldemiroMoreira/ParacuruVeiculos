const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');
const State = require('../models/State');
const City = require('../models/City');

const populateLocations = async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connection successful.');

        console.log('Loading JSON data...');

        // Load JSON files
        const estadosPath = path.resolve(__dirname, '../../database/estados.json');
        const municipiosPath = path.resolve(__dirname, '../../database/municipios.json');

        const estados = JSON.parse(fs.readFileSync(estadosPath, 'utf8'));
        const municipios = JSON.parse(fs.readFileSync(municipiosPath, 'utf8'));

        console.log(`Loaded ${estados.length} states and ${municipios.length} municipalities.`);

        // 1. Populate States
        console.log('Populating States...');
        const stateData = estados.map(e => ({
            name: e.nome,
            abbreviation: e.sigla,
            // Assuming 'regiao' isn't stored in State model currently, based on previous inspection
        }));

        // Using bulkCreate with updateOnDuplicate using abbreviation (PK: uf)
        await State.bulkCreate(stateData, {
            updateOnDuplicate: ['name']
        });
        console.log('States populated.');

        // 2. Populate Cities
        console.log('Populating Cities...');

        const cityData = municipios.map(m => {
            // Extract UF from nested structure: microrregiao -> mesorregiao -> UF -> sigla
            // Data structure verification:
            // {"id":1100015,"nome":"Alta Floresta D'Oeste","microrregiao":{"id":11006,...,"mesorregiao":{"id":1102,...,"UF":{"id":11,"sigla":"RO",...}}}}

            let ufSigla = null;
            if (m.microrregiao && m.microrregiao.mesorregiao && m.microrregiao.mesorregiao.UF) {
                ufSigla = m.microrregiao.mesorregiao.UF.sigla;
            } else if (m['regiao-imediata'] && m['regiao-imediata']['regiao-intermediaria'] && m['regiao-imediata']['regiao-intermediaria'].UF) {
                // Fallback or alternative structure if keys vary, though IBGE export usually has microrregiao
                ufSigla = m['regiao-imediata']['regiao-intermediaria'].UF.sigla;
            }

            if (!ufSigla) {
                console.warn(`Could not find UF for city id ${m.id}: ${m.nome}`);
                return null;
            }

            return {
                id: m.id,
                nome: m.nome,
                uf: ufSigla
            };
        }).filter(c => c !== null);

        // Batch insert for cities
        const BATCH_SIZE = 1000;
        for (let i = 0; i < cityData.length; i += BATCH_SIZE) {
            const batch = cityData.slice(i, i + BATCH_SIZE);
            await City.bulkCreate(batch, {
                updateOnDuplicate: ['nome', 'uf']
            });
            console.log(`Processed cities batch ${i} to ${Math.min(i + BATCH_SIZE, cityData.length)}`);
        }

        console.log('Cities populated successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Error populating locations:', error);
        process.exit(1);
    }
};

populateLocations();
