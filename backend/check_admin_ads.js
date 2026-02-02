const { Usuario, Anuncio, Fabricante, Categoria, Modelo, State, City } = require('./models');
const sequelize = require('./config/database');

async function checkAdminAds() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // 1. Find Admin User
        const adminEmail = 'aldemiro.moreira@gmail.com';
        let admin = await Usuario.findOne({ where: { email: adminEmail } });

        if (!admin) {
            console.log('Admin user not found. Please run seeds.');
            process.exit(1);
        }

        console.log(`Admin Found: ID ${admin.id}, Name: ${admin.nome}`);

        // 2. Check for Ads
        let ad = await Anuncio.findOne({ where: { usuario_id: admin.id } });

        if (ad) {
            console.log(`Existing Ad Found: ID ${ad.id}, Title: ${ad.titulo}`);
        } else {
            console.log('No ads found for admin. Creating "Fale com o Suporte"...');

            // Ensure dependencies exist
            const cat = await Categoria.findOne();
            const fab = await Fabricante.findOne();
            const mod = await Modelo.findOne();
            const state = await State.findOne();
            const city = state ? await City.findOne({ where: { uf: state.abbreviation } }) : null;

            if (!getSafeAndExist(cat, fab, mod, state, city)) {
                console.error("Missing required dependencies (Category, Manufacturer, etc). Run seeds first.");
                process.exit(1);
            }

            ad = await Anuncio.create({
                usuario_id: admin.id,
                titulo: 'Fale com o Suporte',
                descricao: 'Canal direto com a administração.',
                preco: 0,
                ano_fabricacao: 2024,
                ano_modelo: 2024,
                fabricante_id: fab.id,
                modelo_id: mod.id,
                categoria_id: cat.id,
                versao: 'Suporte',
                cor: 'Branco',
                km: 0,
                estado_id: state.abbreviation, // Model expects STRING(2)
                cidade_id: city.id,
                status: 'active'
            });
            console.log(`Created Support Ad: ID ${ad.id}`);
        }

        console.log(`>>> USE_THIS_ID: ${admin.id}`);
        console.log(`>>> USE_THIS_AD_ID: ${ad.id}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

function getSafeAndExist(...args) {
    return args.every(arg => arg !== null && arg !== undefined);
}

checkAdminAds();
