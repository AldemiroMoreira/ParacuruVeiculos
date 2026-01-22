const { Op } = require('sequelize');
const { Anuncio, AnuncioImage, Usuario, Fabricante, Modelo, State, City, EspecieVeiculo } = require('../models');
const fs = require('fs');
const path = require('path');
const imageValidator = require('../utils/imageValidator');

exports.createAnuncio = async (req, res) => {
    try {
        const { titulo, descricao, fabricante_id, modelo_id, ano_fabricacao, km, preco, estado_id, cidade_id, especie_id } = req.body;
        const usuario_id = req.userData.userId; // Middleware provides userId

        // Create Anuncio logic... (keep existing)

        // Handle Images Validation FIRST
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const isValid = await imageValidator.validateImageContent(file.path);
                if (!isValid) {
                    // Cleanup uploaded temp files
                    req.files.forEach(f => {
                        if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
                    });

                    return res.status(400).json({ message: `Imagem ${file.originalname} inválida. Aceitamos apenas fotos de veículos.` });
                }
            }
        }

        // Create Anuncio
        const anuncio = await Anuncio.create({
            usuario_id,
            titulo,
            descricao,
            fabricante_id,
            modelo_id,
            ano_fabricacao,
            km,
            preco,
            estado_id,
            cidade_id,
            especie_id,
            status: 'pending_payment'
        });

        // Handle Images (Move logic)
        if (req.files && req.files.length > 0) {
            // User requested: "imgs/" with subfolders for each ad id
            const adDir = path.join(__dirname, '../../public/imgs', String(anuncio.id));
            if (!fs.existsSync(adDir)) {
                fs.mkdirSync(adDir, { recursive: true });
            }

            const imagePromises = req.files.map(async (file, index) => {
                const oldPath = file.path;
                const newFilename = file.filename;
                const newPath = path.join(adDir, newFilename);

                // Move file from temp uploads to ad specific folder
                fs.renameSync(oldPath, newPath);

                return AnuncioImage.create({
                    anuncio_id: anuncio.id,
                    image_path: `/imgs/${anuncio.id}/${newFilename}`,
                    is_main: index === 0
                });
            });

            await Promise.all(imagePromises);
        }

        res.status(201).json({
            message: 'Anúncio criado com sucesso! Aguardando pagamento.',
            anuncioId: anuncio.id
        });

    } catch (error) {
        console.error("ERRO AO CRIAR ANUNCIO:", error);
        res.status(500).json({
            error: "Erro interno ao criar anúncio.",
            details: error.message
        });
    }
};

exports.getAnuncios = async (req, res) => {
    try {
        const { fabricante_id, modelo_id, estado_id, cidade_id, especie_id, minPrice, maxPrice } = req.query;
        let where = { status: 'active' };

        if (fabricante_id) where.fabricante_id = fabricante_id;
        if (modelo_id) where.modelo_id = modelo_id;
        if (especie_id) where.especie_id = especie_id;
        if (estado_id) where.estado_id = estado_id;
        if (cidade_id) where.cidade_id = cidade_id;

        if (minPrice || maxPrice) {
            where.preco = {};
            if (minPrice) where.preco[Op.gte] = minPrice;
            if (maxPrice) where.preco[Op.lte] = maxPrice;
        }

        const anuncios = await Anuncio.findAll({
            where,
            include: [
                { model: AnuncioImage, as: 'images' },
                { model: Usuario, attributes: ['nome'] },
                { model: Fabricante, attributes: ['nome'] },
                { model: Modelo, attributes: ['nome'] },
                { model: State, attributes: ['name', 'abbreviation'] },
                { model: City, attributes: ['nome'] },
                { model: EspecieVeiculo, attributes: ['nome'] }
            ],
            order: [['created_at', 'DESC']]
        });

        res.status(200).json(anuncios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getAnuncioById = async (req, res) => {
    try {
        const anuncio = await Anuncio.findByPk(req.params.id, {
            include: [
                { model: AnuncioImage, as: 'images' },
                { model: Usuario, attributes: ['nome', 'email'] },
                { model: Fabricante, attributes: ['nome'] },
                { model: Modelo, attributes: ['nome'] },
                { model: State, attributes: ['name', 'abbreviation'] },
                { model: City, attributes: ['nome'] },
                { model: EspecieVeiculo, attributes: ['nome'] }
            ]
        });

        if (!anuncio) return res.status(404).json({ message: 'Anúncio não encontrado' });

        res.status(200).json(anuncio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
