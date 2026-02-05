const { Propaganda } = require('../backend/models');

const ADS = [
    {
        titulo: 'Melhores Ofertas em Pneus e Rodas',
        imagem_url: 'https://paracuruveiculos.com.br/img/ads/ad_tires.png',
        link_destino: 'https://lista.mercadolivre.com.br/acessorios-veiculos/pneus/',
        localizacao: 'sidebar',
        ativo: true
    },
    {
        titulo: 'Som Automotivo de Alta Qualidade',
        imagem_url: 'https://paracuruveiculos.com.br/img/ads/ad_audio.png',
        link_destino: 'https://lista.mercadolivre.com.br/acessorios-veiculos/som-automotivo/',
        localizacao: 'sidebar',
        ativo: true
    },
    {
        titulo: 'Acessórios para seu Carro',
        imagem_url: 'https://paracuruveiculos.com.br/img/ads/ad_accessories.png',
        link_destino: 'https://lista.mercadolivre.com.br/acessorios-veiculos/acessorios-carros-caminhonetes/',
        localizacao: 'sidebar',
        ativo: true
    }
];

async function seedStatic() {
    try {
        console.log('[Seed] Inserting static ads...');
        
        // Clear existing sidebar ads
        await Propaganda.destroy({ where: { localizacao: 'sidebar' } });

        for (const ad of ADS) {
            await Propaganda.create(ad);
        }

        console.log('[Seed] Success! 3 static ads active.');
    } catch (error) {
        console.error('[Seed] Error:', error);
    }
}

seedStatic();
