const { Op } = require('sequelize');
const { Anuncio, AnuncioImage, Usuario, Fabricante, Modelo, State, City, Categoria } = require('../models');
const fs = require('fs');
const path = require('path');
const imageValidator = require('../utils/imageValidator');

exports.createAnuncio = async (req, res) => {
    try {
        const { titulo, descricao, fabricante_id, modelo_id, ano_fabricacao, km, preco, estado_id, cidade_id, categoria_id } = req.body;
        const usuario_id = req.userData.userId; // Middleware provides userId

        // Create Anuncio logic matches original...

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
            categoria_id,
            status: 'pending_payment'
        });

        // Handle Images
        if (req.files && req.files.length > 0) {
            const adDir = path.join(__dirname, '../../public/imgs', String(anuncio.id));
            if (!fs.existsSync(adDir)) {
                fs.mkdirSync(adDir, { recursive: true });
            }

            const imagePromises = req.files.map(async (file, index) => {
                const oldPath = file.path;
                const newFilename = file.filename;
                const newPath = path.join(adDir, newFilename);

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
        const { fabricante_id, modelo_id, estado_id, cidade_id, categoria_id, minPrice, maxPrice, minKm, maxKm, minYear, maxYear, sort } = req.query;
        let where = { status: 'active' };

        if (fabricante_id) where.fabricante_id = fabricante_id;
        if (modelo_id) where.modelo_id = modelo_id;
        if (categoria_id) where.categoria_id = categoria_id;
        if (estado_id) where.estado_id = estado_id;
        if (cidade_id) where.cidade_id = cidade_id;

        if (minPrice || maxPrice) {
            where.preco = {};
            if (minPrice) where.preco[Op.gte] = minPrice;
            if (maxPrice) where.preco[Op.lte] = maxPrice;
        }

        if (minKm || maxKm) {
            where.km = {};
            if (minKm) where.km[Op.gte] = minKm;
            if (maxKm) where.km[Op.lte] = maxKm;
        }

        if (minYear || maxYear) {
            where.ano_fabricacao = {};
            if (minYear) where.ano_fabricacao[Op.gte] = minYear;
            if (maxYear) where.ano_fabricacao[Op.lte] = maxYear;
        }

        let order = [['created_at', 'DESC']]; // default
        if (sort === 'price_asc') order = [['preco', 'ASC']];
        if (sort === 'price_desc') order = [['preco', 'DESC']];
        if (sort === 'year_desc') order = [['ano_fabricacao', 'DESC']];
        if (sort === 'km_asc') order = [['km', 'ASC']];

        const anuncios = await Anuncio.findAll({
            where,
            include: [
                { model: AnuncioImage, as: 'images' },
                { model: Usuario, attributes: ['nome'] },
                { model: Fabricante, attributes: ['nome'] },
                { model: Modelo, attributes: ['nome'] },
                { model: State, attributes: ['name', 'abbreviation'] },
                { model: City, attributes: ['nome'] },
                { model: Categoria, attributes: ['nome'] }
            ],
            order
        });

        res.status(200).json(anuncios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.getMeusAnuncios = async (req, res) => {
    try {
        const usuario_id = req.userData.userId;
        const anuncios = await Anuncio.findAll({
            where: { usuario_id },
            include: [
                { model: AnuncioImage, as: 'images' },
                { model: Fabricante, attributes: ['nome'] },
                { model: Modelo, attributes: ['nome'] }
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
                { model: Categoria, attributes: ['nome'] }
            ]
        });

        if (!anuncio) return res.status(404).json({ message: 'Anúncio não encontrado' });

        res.status(200).json(anuncio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteAnuncio = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = req.userData.userId;

        const anuncio = await Anuncio.findOne({ where: { id, usuario_id } });

        if (!anuncio) {
            return res.status(404).json({ message: 'Anúncio não encontrado ou você não tem permissão para excluí-lo.' });
        }

        // Delete images folder
        const adDir = path.join(__dirname, '../../public/imgs', String(anuncio.id));
        if (fs.existsSync(adDir)) {
            fs.rmSync(adDir, { recursive: true, force: true });
        }

        // Delete from DB (Images should cascade if configured, but explicit delete is safe)
        await AnuncioImage.destroy({ where: { anuncio_id: anuncio.id } });
        await anuncio.destroy();

        res.status(200).json({ message: 'Anúncio excluído com sucesso.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir anúncio.' });
    }
};

exports.updateAnuncio = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = req.userData.userId;
        const { titulo, descricao, preco, ano_fabricacao, km, fabricante_id, modelo_id, estado_id, cidade_id, categoria_id } = req.body;

        const anuncio = await Anuncio.findOne({ where: { id, usuario_id } });
        if (!anuncio) {
            return res.status(404).json({ message: 'Anúncio não encontrado ou permissão negada.' });
        }

        await anuncio.update({
            titulo, descricao, preco, ano_fabricacao, km,
            fabricante_id, modelo_id, estado_id, cidade_id, categoria_id
        });

        // Handle NEW Images
        if (req.files && req.files.length > 0) {
            const adDir = path.join(__dirname, '../../public/imgs', String(anuncio.id));
            if (!fs.existsSync(adDir)) {
                fs.mkdirSync(adDir, { recursive: true });
            }

            const imagePromises = req.files.map(async (file) => {
                const oldPath = file.path;
                const newFilename = file.filename;
                const newPath = path.join(adDir, newFilename);

                fs.renameSync(oldPath, newPath);

                return AnuncioImage.create({
                    anuncio_id: anuncio.id,
                    image_path: `/imgs/${anuncio.id}/${newFilename}`,
                    is_main: false // Default to false for appended images
                });
            });

            await Promise.all(imagePromises);
        }

        res.status(200).json({ message: 'Anúncio atualizado com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar anúncio.' });
    }
};

exports.deleteImage = async (req, res) => {
    try {
        const { id, imageId } = req.params; // id=anuncioId, imageId=imageId
        const usuario_id = req.userData.userId;

        const anuncio = await Anuncio.findOne({ where: { id, usuario_id } });
        if (!anuncio) return res.status(404).json({ message: 'Anúncio não encontrado.' });

        const image = await AnuncioImage.findOne({ where: { id: imageId, anuncio_id: id } });
        if (!image) return res.status(404).json({ message: 'Imagem não encontrada.' });

        // Delete file from filesystem
        const filePath = path.join(__dirname, '../../public', image.image_path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await image.destroy();

        res.status(200).json({ message: 'Imagem removida.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao excluir imagem.' });
    }
};
