const { Plano } = require('./models');

async function addTestPlan() {
    try {
        console.log('Checking for Test Plan...');

        const existingPlan = await Plano.findOne({ where: { nome: 'Teste' } });

        if (existingPlan) {
            console.log('Plan "Teste" already exists. Updating price to 0.10...');
            existingPlan.preco = 0.10;
            // Ensure duration is reasonable, e.g., 1 day or 7 days? User didn't specify, assuming 1 day for test.
            // Or keeping existing duration.
            await existingPlan.save();
            console.log('Plan updated.');
        } else {
            console.log('Creating new Plan "Teste" (0.10)...');
            await Plano.create({
                nome: 'Teste',
                duracao_dias: 1, // Defaulting to 1 day for a 0.10 test
                preco: 0.10,
                descricao: 'Plano de teste (R$ 0,10)'
            });
            console.log('Plan created.');
        }

    } catch (error) {
        console.error('Error adding plan:', error);
    }
}

addTestPlan();
