const { Anuncio, Usuario, AnuncioImage } = require('./models');

async function listAds() {
    try {
        const user = await Usuario.findOne({ where: { email: 'aldemiro.moreira@gmail.com' } });
        if (!user) {
            console.log('User not found');
            return;
        }

        const ads = await Anuncio.findAll({
            where: { usuario_id: user.id },
            order: [['created_at', 'DESC']], // Corrected sorting column based on model definition
            limit: 5
        });

        console.log(`Found ${ads.length} ads for user ${user.email} (ID: ${user.id})`);

        for (const ad of ads) {
            console.log(`--- AD ID: ${ad.id} | Title: ${ad.titulo} | Created: ${ad.created_at} ---`);

            // Fetch images for this ad
            const images = await AnuncioImage.findAll({ where: { anuncio_id: ad.id } });

            if (images.length > 0) {
                console.log(`IMAGES_FOUND: ${images.length}`);
                images.forEach(img => {
                    console.log(`IMAGE_FILE: ${img.image_path}`);
                });
            } else {
                console.log('No images found for this ad.');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

listAds();
