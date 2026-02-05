const { Propaganda } = require('../backend/models');

const MANUAL_LINKS = [
    'https://mercadolivre.com/sec/1YpNoND',
    'https://mercadolivre.com/sec/2WuA69v',
    'https://mercadolivre.com/sec/2Q2b31i',
    'https://mercadolivre.com/sec/1U1oCB2',
    'https://mercadolivre.com/sec/1KLGfYg',
    'https://mercadolivre.com/sec/2X6bw26',
    'https://mercadolivre.com/sec/2X6bw26',
    'https://mercadolivre.com/sec/2w2LxKq',
    'https://mercadolivre.com/sec/21SmTpS',
    'https://mercadolivre.com/sec/2T9yJvu',
    'https://mercadolivre.com/sec/1vdRrsd',
    'https://mercadolivre.com/sec/1HjgXv6',
    'https://mercadolivre.com/sec/1iof18M',
    'https://mercadolivre.com/sec/2q8gmeK'
];

const STATIC_ASSETS = [
    { title: 'Oferta: Pneus e Rodas', img: 'https://paracuruveiculos.com.br/img/ads/ad_tires.png' },
    { title: 'Oferta: Som Automotivo', img: 'https://paracuruveiculos.com.br/img/ads/ad_audio.png' },
    { title: 'Oferta: Acessórios', img: 'https://paracuruveiculos.com.br/img/ads/ad_accessories.png' }
];

async function seedManual() {
    try {
        console.log('[Seed] Inserting manual links...');

        // Clear existing sidebar ads
        await Propaganda.destroy({ where: { localizacao: 'sidebar' } });

        for (let i = 0; i < MANUAL_LINKS.length; i++) {
            const link = MANUAL_LINKS[i];
            const asset = STATIC_ASSETS[i % STATIC_ASSETS.length]; // Rotate assets

            await Propaganda.create({
                titulo: asset.title,
                imagem_url: asset.img,
                link_destino: link,
                localizacao: 'sidebar',
                ativo: true
            });
        }

        console.log(`[Seed] Success! ${MANUAL_LINKS.length} ads active.`);
    } catch (error) {
        console.error('[Seed] Error:', error);
    }
}

seedManual();
