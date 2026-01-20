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

    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1024; // Reduce max width to 1024
                    const MAX_HEIGHT = 1024;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG with 0.7 quality
                    canvas.toBlob((blob) => {
                        const newFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(newFile);
                    }, 'image/jpeg', 0.7);
                };
            };
        });
    };

    const handleImageChange = async (e) => {
        const files = Array.from(e.target.files);

        // Indicate loading implicitly or user can wait, for better UX maybe add a small loader if needed, 
        // but for now await all compressions
        const compressedFiles = await Promise.all(files.map(file => compressImage(file)));

        setImages(prev => [...prev, ...compressedFiles]);

        // Create new previews
        const newPreviews = compressedFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
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
                        <input name="titulo" value={formData.titulo} onChange={handleChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500" placeholder="Ex: Honda Civic 2020 Completo" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                        <input name="preco" type="number" value={formData.preco} onChange={handleChange} required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500" placeholder="0,00" />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <input name="ano_fabricacao" type="number" value={formData.ano_fabricacao} onChange={handleChange} required className="p-3 border rounded-lg" placeholder="Ano" />
                    <input name="km" type="number" value={formData.km} onChange={handleChange} required className="p-3 border rounded-lg" placeholder="KM" />

                    <select name="fabricante_id" value={formData.fabricante_id} onChange={handleFabricanteChange} required className="p-3 border rounded-lg bg-white">
                        <option value="">Marca</option>
                        {fabricantes.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                    </select>

                    <select name="modelo_id" value={formData.modelo_id} onChange={handleChange} required className="p-3 border rounded-lg bg-white" disabled={!modelos.length}>
                        <option value="">Modelo</option>
                        {modelos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                    </select>

                    <select name="plan_id" value={formData.plan_id} onChange={handleChange} className="p-3 border rounded-lg bg-white">
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
                    <textarea name="descricao" rows="4" value={formData.descricao} onChange={handleChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500"></textarea>
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
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newImages = images.filter((_, i) => i !== index);
                                            const newPreviews = previews.filter((_, i) => i !== index);
                                            setImages(newImages);
                                            setPreviews(newPreviews);
                                            // Optional: Revoke URL to free memory, though React might handle it eventually, explicit is better
                                            URL.revokeObjectURL(previews[index]);
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                                        title="Remover imagem"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                    </button>
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
