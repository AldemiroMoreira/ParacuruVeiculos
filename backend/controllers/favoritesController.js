const { Favorite, Anuncio, AnuncioImage, Fabricante, Modelo } = require('../models');

exports.toggleFavorite = async (req, res) => {
    try {
        const { anuncioId } = req.body;
        const usuarioId = req.userData.userId; // Fixed: userId matches authController payload

        const existing = await Favorite.findOne({
            where: {
                usuario_id: usuarioId,
                anuncio_id: anuncioId
            }
        });

        if (existing) {
            await existing.destroy();
            return res.status(200).json({ favorited: false, message: 'Removido dos favoritos' });
        } else {
            await Favorite.create({
                usuario_id: usuarioId,
                anuncio_id: anuncioId
            });
            return res.status(201).json({ favorited: true, message: 'Adicionado aos favoritos' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar favoritos' });
    }
};

exports.getFavorites = async (req, res) => {
    try {
        const usuarioId = req.userData.userId;

        const favorites = await Favorite.findAll({
            where: { usuario_id: usuarioId },
            include: [{
                model: Anuncio,
                include: [
                    { model: AnuncioImage, as: 'images' },
                    { model: Fabricante },
                    { model: Modelo }
                    // Add State/City here if needed for card display
                ]
            }],
            order: [['createdAt', 'DESC']]
        });

        // Format for frontend (flatten structure if needed, or send as is)
        // Frontend AdCard expects ad object.
        const ads = favorites.map(fav => fav.Anuncio);

        res.json(ads);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar favoritos' });
    }
};

exports.checkFavoriteStatus = async (req, res) => {
    // Return list of favorite ad IDs for quick check
    try {
        const usuarioId = req.userData.userId;
        const favorites = await Favorite.findAll({
            where: { usuario_id: usuarioId },
            attributes: ['anuncio_id']
        });
        const ids = favorites.map(f => f.anuncio_id);
        res.json(ids);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao verificar favoritos' });
    }
};
