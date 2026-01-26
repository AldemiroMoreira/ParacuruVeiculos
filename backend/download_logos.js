const fs = require('fs');
const path = require('path');
const https = require('https');
const { Fabricante } = require('./models');

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };

        const request = https.get(url, options, (response) => {
            // Handle redirects
            if (response.statusCode === 301 || response.statusCode === 302) {
                const newUrl = response.headers.location;
                file.close();
                fs.unlink(filepath, () => { }); // cleanup empty file
                downloadImage(newUrl, filepath).then(resolve).catch(reject);
                return;
            }

            if (response.statusCode !== 200) {
                file.close();
                fs.unlink(filepath, () => { });
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                return;
            }

            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        });

        request.on('error', (err) => {
            file.close();
            fs.unlink(filepath, () => { });
            reject(err);
        });
    });
};

const logos = {
    // CARS (using reliable GitHub repo)
    'Honda': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/honda.png',
    'Toyota': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/toyota.png',
    'Chevrolet': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/chevrolet.png',
    'Volkswagen': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/volkswagen.png',
    'Fiat': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/fiat.png',
    'Ford': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/ford.png',
    'Hyundai': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/hyundai.png',
    'Renault': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/renault.png',
    'Nissan': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/nissan.png',
    'Jeep': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/jeep.png',
    'BMW': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/bmw.png',
    'Suzuki': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/suzuki.png',
    'Kia': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/kia.png',
    'Citroën': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/citroen.png',
    'Audi': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/audi.png',
    'Peugeot': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/peugeot.png',
    'Mercedes-Benz': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/mercedes-benz.png',
    'BYD': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/byd.png',
    'Chery': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/chery.png',
    'CAOA Chery': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/chery.png',

    // MOTOS & OTHERS (Fixing broken ones)
    'Yamaha': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/yamaha.png', // Better source
    'Kawasaki': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Kawasaki.svg/320px-Kawasaki.svg.png',
    'Harley-Davidson': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Harley-Davidson_logo.svg/320px-Harley-Davidson_logo.svg.png',
    'Triumph': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Triumph_Motorcycles_logo.svg/320px-Triumph_Motorcycles_logo.svg.png',
    'Royal Enfield': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Royal_Enfield_%282014%29_logo.svg/320px-Royal_Enfield_%282014%29_logo.svg.png',

    'Dafra': 'https://upload.wikimedia.org/wikipedia/commons/7/77/Dafra_Motos_logo.png', // Wiki (Retrying)
    'GWM': 'https://www.gwm-global.com/dist/images/home-page/cc_logo.png', // Direct from Global site
    'Ducati': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Ducati_red_logo.svg/320px-Ducati_red_logo.svg.png',
    'Haojue': 'https://logovector.net/wp-content/uploads/2011/02/Haojue-Is-195x195.png',
    'Shineray': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Shineray_logo.png/320px-Shineray_logo.png',
    'Fiat': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/fiat.png',
    'Ford': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/ford.png',

    // NEW ADDITIONS
    'Ram': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/ram.png',
    'Porsche': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/porsche.png',
    'Mini': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/mini.png',
    'Subaru': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/subaru.png',
    'Lexus': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/lexus.png',
    'Jaguar': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/jaguar.png',
    'Mitsubishi': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/mitsubishi.png', // Just ensuring
    'Lada': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/lada.png',
    'Iveco': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/iveco.png',
    'Volvo': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/volvo.png',
    'Land Rover': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/land-rover.png',

    // NEW MOTOS
    'Bajaj': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Bajaj_Auto_Logo.svg/320px-Bajaj_Auto_Logo.svg.png',
    'Avelloz': 'https://avelloz.com.br/wp-content/uploads/2021/08/logo-avelloz-branca-e1629833544158.png', // Might fail if 403, but trying official
    'Zontes': 'https://zontes.com.br/wp-content/uploads/2023/03/logo-zontes-1.png', // Trying official

    // TRUCKS
    'Scania': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/scania.png',
    'DAF': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/DAF_logo.svg/320px-DAF_logo.svg.png',
    'Mercedes-Benz': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/mercedes-benz.png', // Already there but safe
    'Volvo': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/volvo.png',
    'Iveco': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/iveco.png',
    'Volkswagen': 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/volkswagen.png',

    // BOATS
    'Fibrafort': 'https://www.fibrafort.com.br/assets/img/logo-fibrafort.png', // Official site, might block or 403
    'Schaefer Yachts': 'https://schaeferyachts.com/wp-content/uploads/2020/09/logo-header-1.png', // Official
    'Sea-Doo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Sea-Doo_logo.svg/320px-Sea-Doo_logo.svg.png',
    'Bayliner': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Bayliner_logo.svg/320px-Bayliner_logo.svg.png',

    // AIRCRAFT
    'Embraer': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Embraer_logo.svg/320px-Embraer_logo.svg.png',
    'Cessna': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Cessna_logo.svg/320px-Cessna_logo.svg.png',
    'Piper': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Piper_Aircraft_logo.svg/320px-Piper_Aircraft_logo.svg.png',
    'Robinson': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Robinson_Helicopter_Company_Logo.svg/320px-Robinson_Helicopter_Company_Logo.svg.png'
};

const run = async () => {
    const logosDir = path.join(__dirname, '../public/imgs/logos');

    // Create directory
    if (!fs.existsSync(logosDir)) {
        fs.mkdirSync(logosDir, { recursive: true });
        console.log(`Created directory: ${logosDir}`);
    }

    // Process each logo
    for (const [brand, url] of Object.entries(logos)) {
        try {
            // Determine filename
            const cleanName = brand.toLowerCase().replace(/[^a-z0-9]/g, '_');
            const ext = url.endsWith('.png') ? '.png' : '.png'; // Defaulting to png for sanity
            const filename = `${cleanName}${ext}`;
            const filepath = path.join(logosDir, filename);
            const publicPath = `/imgs/logos/${filename}`;

            console.log(`Downloading ${brand}...`);
            await downloadImage(url, filepath);

            // Update DB
            const fab = await Fabricante.findOne({ where: { nome: brand } });
            if (fab) {
                await fab.update({ logo_url: publicPath });
                console.log(`Updated DB for ${brand} -> ${publicPath}`);
            } else {
                console.warn(`Manufacturer ${brand} not found in DB.`);
            }

        } catch (err) {
            console.error(`Error processing ${brand}: ${err.message}`);
        }
    }

    console.log('Done downloading logos.');
    process.exit(0);
};

run();
