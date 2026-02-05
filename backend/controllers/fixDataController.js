const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { State, City, Usuario } = require('../models');
const { Op } = require('sequelize');

exports.fixEverything = async (req, res) => {
    try {
        const results = {
            states: 0,
            cities: 0,
            users: []
        };

        // 1. POPULATE LOCATIONS
        const estadosPath = path.resolve(__dirname, '../../database/estados.json');
        const municipiosPath = path.resolve(__dirname, '../../database/municipios.json');

        if (fs.existsSync(estadosPath) && fs.existsSync(municipiosPath)) {
            const estados = JSON.parse(fs.readFileSync(estadosPath, 'utf8'));
            const municipios = JSON.parse(fs.readFileSync(municipiosPath, 'utf8'));

            // States
            const stateData = estados.map(e => ({
                name: e.nome,
                abbreviation: e.sigla,
            }));
            await State.bulkCreate(stateData, { updateOnDuplicate: ['name'] });
            results.states = stateData.length;

            // Cities
            const cityData = municipios.map(m => {
                let ufSigla = null;
                if (m.microrregiao && m.microrregiao.mesorregiao && m.microrregiao.mesorregiao.UF) {
                    ufSigla = m.microrregiao.mesorregiao.UF.sigla;
                } else if (m['regiao-imediata'] && m['regiao-imediata']['regiao-intermediaria'] && m['regiao-imediata']['regiao-intermediaria'].UF) {
                    ufSigla = m['regiao-imediata']['regiao-intermediaria'].UF.sigla;
                }

                if (!ufSigla) return null;

                return {
                    id: m.id,
                    nome: m.nome,
                    uf: ufSigla
                };
            }).filter(c => c !== null);

            // Batch insert cities
            const BATCH_SIZE = 1000;
            for (let i = 0; i < cityData.length; i += BATCH_SIZE) {
                const batch = cityData.slice(i, i + BATCH_SIZE);
                await City.bulkCreate(batch, { updateOnDuplicate: ['nome', 'uf'] });
            }
            results.cities = cityData.length;
        }

        // 2. ENFORCE USERS
        const usersToEnforce = [
            {
                nome: 'Alder',
                email: 'aldemiro.moreira@gmail.com',
                password: '91254413',
                isAdmin: true
            },
            {
                nome: 'Cristina',
                email: 'tcristina.mv@gmail.com',
                password: '10042012',
                isAdmin: false
            },
            {
                nome: 'Harisson',
                email: 'harissonadv@hotmail.com',
                password: '856281',
                isAdmin: false
            }
        ];

        // Delete unauthorized
        const emails = usersToEnforce.map(u => u.email);
        await Usuario.destroy({
            where: { email: { [Op.notIn]: emails } }
        });

        // Upsert users
        for (const u of usersToEnforce) {
            const existing = await Usuario.findOne({ where: { email: u.email } });
            const password_hash = await bcrypt.hash(u.password, 10);

            if (existing) {
                existing.nome = u.nome;
                existing.password_hash = password_hash;
                existing.isAdmin = u.isAdmin;
                existing.isVerified = true;
                existing.activationToken = null;
                await existing.save();
                results.users.push(`Updated ${u.nome}`);
            } else {
                await Usuario.create({
                    nome: u.nome,
                    email: u.email,
                    password_hash: password_hash,
                    isAdmin: u.isAdmin,
                    isVerified: true,
                    isBanned: false
                });
                results.users.push(`Created ${u.nome}`);
            }
        }

        res.json({
            message: 'Fix executed successfully!',
            results
        });

    } catch (error) {
        console.error('Fix Error:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
};
