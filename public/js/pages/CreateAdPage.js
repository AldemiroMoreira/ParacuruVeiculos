const CreateAdPage = ({ user, navigateTo }) => {
    const [formData, setFormData] = React.useState({
        titulo: '', descricao: '', preco: '', ano_fabricacao: '', km: '', fabricante_id: '', modelo_id: '', estado_id: '', cidade_id: '', plan_id: '1'
    });
    const [images, setImages] = React.useState([]);
    const [previews, setPreviews] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [states, setStates] = React.useState([]);
    const [cities, setCities] = React.useState([]);
    const [fabricantes, setFabricantes] = React.useState([]);
    const [modelos, setModelos] = React.useState([]);

    React.useEffect(() => {
        // Fetch States
        api.get('/locations/states')
            .then(res => setStates(res.data))
            .catch(err => console.error(err));

        // Fetch Fabricantes
        api.get('/resources/fabricantes')
            .then(res => setFabricantes(res.data))
            .catch(err => console.error(err));

        // Cleanup previews
        return () => {
            previews.forEach(url => URL.revokeObjectURL(url));
        };
    }, []); // Note: this effect runs on mount, but the cleanup for previews needs to happen when previews change or unmount. Ideally separate effects or just cleanup on unmount is fine for simple SPA. 
    // Actually, to reference 'previews' in cleanup, I need it in dependency array or use a functional cleanup that closes over the values? No, standard useEffect cleanup works with dependencies.
    // Let's make a separate effect for preview cleanup to be clean.

    React.useEffect(() => {
        return () => {
            previews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previews]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);

        // Create new previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);
    };

    const handleStateChange = (e) => {
        const stateId = e.target.value;
        setFormData(prev => ({ ...prev, estado_id: stateId, cidade_id: '' }));

        if (stateId) {
            api.get(`/locations/cities/${stateId}`)
                .then(res => setCities(res.data))
                .catch(err => console.error(err));
        } else {
            setCities([]);
        }
    };

    const handleFabricanteChange = (e) => {
        const fabId = e.target.value;
        setFormData(prev => ({ ...prev, fabricante_id: fabId, modelo_id: '' }));

        if (fabId) {
            api.get(`/resources/modelos/${fabId}`)
                .then(res => setModelos(res.data))
                .catch(err => console.error(err));
        } else {
            setModelos([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            images.forEach(image => data.append('images', image));

            const token = localStorage.getItem('token');
            const response = await api.post('/anuncios', data, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Navigate to checkout with the created ad ID and Plan ID
            // Backend returns { anuncioId: ... }
            navigateTo('checkout', {
                adId: response.data.anuncioId,
                planId: formData.plan_id
            });

        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erro ao criar anuncio. Verifique os dados.';

            if (errorMessage === 'Auth failed' || error.response?.status === 401) {
                alert("Sua sessão expirou. Por favor, faça login novamente.");
                navigateTo('login');
            } else {
                alert(errorMessage);
            }
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100 fade-in">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Anunciar Veículo</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título do Anúncio</label>
                        <input name="titulo" onChange={handleChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500" placeholder="Ex: Honda Civic 2020 Completo" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                        <input name="preco" type="number" onChange={handleChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500" placeholder="0,00" />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <input name="ano_fabricacao" type="number" onChange={handleChange} required className="p-3 border rounded-lg" placeholder="Ano" />
                    <input name="km" type="number" onChange={handleChange} required className="p-3 border rounded-lg" placeholder="KM" />

                    <select name="fabricante_id" onChange={handleFabricanteChange} required className="p-3 border rounded-lg bg-white">
                        <option value="">Marca</option>
                        {fabricantes.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                    </select>

                    <select name="modelo_id" onChange={handleChange} required className="p-3 border rounded-lg bg-white" disabled={!modelos.length}>
                        <option value="">Modelo</option>
                        {modelos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                    </select>

                    <select name="plan_id" onChange={handleChange} className="p-3 border rounded-lg bg-white">
                        <option value="1">Plano Básico (15 dias) - R$ 30,00</option>
                        <option value="2">Plano Premium (30 dias) - R$ 50,00</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <select name="estado_id" value={formData.estado_id} onChange={handleStateChange} required className="p-3 border rounded-lg bg-white">
                        <option value="">Estado</option>
                        {states.map(state => (
                            <option key={state.abbreviation} value={state.abbreviation}>{state.name}</option>
                        ))}
                    </select>
                    <select name="cidade_id" value={formData.cidade_id} onChange={handleChange} required className="p-3 border rounded-lg bg-white" disabled={!cities.length}>
                        <option value="">Cidade</option>
                        {cities.map(city => (
                            <option key={city.id} value={city.id}>{city.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea name="descricao" rows="4" onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500"></textarea>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
                    <input type="file" multiple max="9" onChange={handleImageChange} className="hidden" id="file-upload" accept="image/*" />
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="text-gray-500 font-medium">
                            <span className="text-brand-600">Clique para upload</span> ou arraste imagens
                        </div>
                        <div className="text-xs text-gray-400 mt-2">Até 9 imagens (Max 5MB cada)</div>
                    </label>
                    {previews.length > 0 && (
                        <div className="mt-6 grid grid-cols-3 gap-4">
                            {previews.map((src, index) => (
                                <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 shadow-sm group">
                                    <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button type="submit" disabled={loading} className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30">
                    {loading ? 'Criando...' : 'Criar Anúncio e Ir para Pagamento'}
                </button>
            </form>
        </div>
    );
};
