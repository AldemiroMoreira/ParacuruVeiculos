const { Anuncio, Payment, Usuario } = require('../models');

exports.getRecentAds = async (req, res) => {
    try {
        const ads = await Anuncio.findAll({
            limit: 10,
            order: [['createdAt', 'DESC']],
            include: [{ model: Usuario, attributes: ['nome', 'email'] }]
        });
        res.status(200).json(ads);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const totalAnuncios = await Anuncio.count();
        const totalPagos = await Anuncio.count({ where: { status: 'active' } }); // Assuming active = paid
        const totalPendentes = await Anuncio.count({ where: { status: 'pending_payment' } });

        // Sum total revenue
        const totalFaturadoRaw = await Payment.sum('amount', { where: { status: 'approved' } });
        const totalFaturado = totalFaturadoRaw || 0;

        res.status(200).json({
            totalAnuncios,
            totalPagos,
            totalPendentes,
            totalFaturado
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
