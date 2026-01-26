const { Fabricante } = require('./models');

async function check() {
    const manufactures = ['Dafra', 'GWM', 'Haojue', 'Harley-Davidson', 'Fiat'];
    for (const m of manufactures) {
        const f = await Fabricante.findOne({ where: { nome: m } });
        if (f) console.log(`${m}: ${f.logo_url}`);
        else console.log(`${m}: Not found`);
    }
    process.exit(0);
}
check();
