const { State, City } = require('../models');

exports.getStates = async (req, res) => {
    try {
        const states = await State.findAll({
            order: [['name', 'ASC']]
        });
        res.json(states);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar estados' });
    }
};

exports.getCities = async (req, res) => {
    try {
        const { stateId } = req.params; // In fontend, stateId is the UF (e.g., 'CE')
        const cities = await City.findAll({
            where: { uf: stateId },
            order: [['nome', 'ASC']]
        });
        // Frontend expects 'name' and 'id'. Map 'nome' to 'name' for compatibility if needed, 
        // OR update frontend to use 'nome'.
        // Frontend (CreateAdPage.js) uses city.name.
        // Let's map it right here to avoid frontend chaos.
        const responseData = cities.map(c => ({
            id: c.id,
            name: c.nome, // Map DB 'nome' back to 'name' expected by frontend
            uf: c.uf
        }));
        res.json(responseData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar cidades' });
    }
};
