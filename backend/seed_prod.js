const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');
const { EspecieVeiculo, Fabricante, Modelo, State: Estado, City: Cidade, Plano, Usuario } = require('./models');

// Load JSON data
const fabricantesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../database/fabricantes.json'), 'utf-8'));
const modelosData = JSON.parse(fs.readFileSync(path.join(__dirname, '../database/modelos.json'), 'utf-8'));
const estadosData = JSON.parse(fs.readFileSync(path.join(__dirname, '../database/estados.json'), 'utf-8'));
const municipiosData = JSON.parse(fs.readFileSync(path.join(__dirname, '../database/municipios.json'), 'utf-8'));

async function seed() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected! Syncing models...');
        // await sequelize.sync(); // Avoid sync if already synced by server, but harmless if safe.

        // 1. Especies
        console.log('Seeding Especies...');
        const especies = ['Carro', 'Moto', 'Caminhão', 'Van/Utilitário', 'Outros'];
        for (const nome of especies) {
            await EspecieVeiculo.findOrCreate({ where: { nome } });
        }

        // 2. Fabricantes
        console.log('Seeding Fabricantes...');
        for (const fab of fabricantesData) {
            await Fabricante.upsert({ id: fab.id, nome: fab.nome });
        }

        // 3. Modelos
        console.log('Seeding Modelos...');
        // Insert in chunks to avoid packet size issues
        const chunkSize = 50;
        for (let i = 0; i < modelosData.length; i += chunkSize) {
            const chunk = modelosData.slice(i, i + chunkSize);
            await Modelo.bulkCreate(chunk, { updateOnDuplicate: ['nome', 'fabricante_id'] });
        }

        // 4. Estados
        console.log('Seeding Estados...');
        const estados = estadosData.map(e => ({ abbreviation: e.sigla, name: e.nome }));
        await Estado.bulkCreate(estados, { updateOnDuplicate: ['name'] });

        // 5. Cidades
        console.log('Seeding Cidades...');
        const cidades = municipiosData.map(m => {
            // Safe navigation for nested UF sigla
            let uf = null;
            if (m.microrregiao && m.microrregiao.mesorregiao && m.microrregiao.mesorregiao.UF) {
                uf = m.microrregiao.mesorregiao.UF.sigla;
            } else if (m['regiao-imediata'] && m['regiao-imediata']['regiao-intermediaria'] && m['regiao-imediata']['regiao-intermediaria'].UF) {
                uf = m['regiao-imediata']['regiao-intermediaria'].UF.sigla;
            }

            if (!uf) {
                console.warn(`Skipping city ${m.nome} (no UF found)`);
                return null;
            }

            return {
                id: m.id,
                nome: m.nome,
                uf: uf
            };
        }).filter(c => c !== null);

        // Bulk insert cities in chunks
        for (let i = 0; i < cidades.length; i += 1000) {
            const chunk = cidades.slice(i, i + 1000);
            await Cidade.bulkCreate(chunk, { ignoreDuplicates: true });
            console.log(`  Seeded cities ${i} to ${i + chunk.length}`);
        }

        // 6. Planos
        console.log('Seeding Planos...');
        await Plano.findOrCreate({
            where: { nome: 'Teste na produção!' },
            defaults: {
                duracao_dias: 30, // Assuming 30 days
                preco: 0.05
            }
        });
        // Ensure standard plans exist too if needed, but user asked specifically for this one.

        // 7. Usuario Cristina
        console.log('Seeding Usuario Cristina...');
        const email = 'tcristina.mv@gmail.com';
        const password = '10042012';
        const hashedPassword = await bcrypt.hash(password, 10);

        const [user, created] = await Usuario.findOrCreate({
            where: { email },
            defaults: {
                nome: 'Cristina',
                password_hash: hashedPassword
            }
        });

        if (!created) {
            // Update password if exists? Maybe better not to overwrite if user has changed it.
            // But user asked to "Include", implying reset/ensure.
            user.password_hash = hashedPassword;
            await user.save();
            console.log('Updated existing user Cristina.');
        } else {
            console.log('Created user Cristina.');
        }

        console.log('✅ Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
