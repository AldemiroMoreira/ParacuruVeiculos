const { Ad, AdImage, Plan, User } = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../public/uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Unique filename: Date + Random + Original Name
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas imagens sao permitidas.'));
        }
    }
});

exports.uploadMiddleware = upload.array('images', 9);

exports.listAds = async (req, res) => {
    try {
        const { search, state, city, make, model, minPrice, maxPrice, year } = req.query;
        let where = { status: 'active' }; // Only show active/paid ads

        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
                { make: { [Op.like]: `%${search}%` } },
                { model: { [Op.like]: `%${search}%` } }
            ];
        }
        if (state) where.state = state;
        if (city) where.city = city;
        if (year) where.year = year;
        if (minPrice && maxPrice) where.price = { [Op.between]: [minPrice, maxPrice] };
        else if (minPrice) where.price = { [Op.gte]: minPrice };
        else if (maxPrice) where.price = { [Op.lte]: maxPrice };


        const ads = await Ad.findAll({
            where,
            include: [
                { model: AdImage, as: 'images' },
                { model: User, attributes: ['name'] } // Hide email
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(ads);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar anuncios.' });
    }
};

exports.getAd = async (req, res) => {
    try {
        const ad = await Ad.findByPk(req.params.id, {
            include: [
                { model: AdImage, as: 'images' },
                { model: User, attributes: ['name'] }
            ]
        });
        if (!ad) return res.status(404).json({ error: 'Anuncio nao encontrado.' });
        res.json(ad);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar anuncio.' });
    }
};

exports.createAd = async (req, res) => {
    try {
        // req.user comes from auth middleware
        const { title, description, price, year, make, model, state, city, plan_id } = req.body;

        // Basic fields validation
        if (!title || !price || !year || !state || !city || !plan_id) {
            return res.status(400).json({ error: 'Campos obrigatorios faltando.' });
        }

        const newAd = await Ad.create({
            user_id: req.user.id,
            title,
            description,
            price,
            year,
            make,
            model,
            state,
            city,
            plan_id,
            status: 'pending' // Pending payment
        });

        // Handle Images
        if (req.files && req.files.length > 0) {
            const imagePromises = req.files.map((file, index) => {
                return AdImage.create({
                    ad_id: newAd.id,
                    image_path: `/uploads/${file.filename}`,
                    is_main: index === 0
                });
            });
            await Promise.all(imagePromises);
        }

        res.status(201).json({
            message: 'Anuncio criado! Prossiga para o pagamento.',
            adId: newAd.id,
            planId: plan_id
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar anuncio.' });
    }
};
