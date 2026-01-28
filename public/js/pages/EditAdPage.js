const EditAdPage = ({ user, navigateTo }) => {
    const [formData, setFormData] = React.useState({
        titulo: '', descricao: '', preco: '', ano_fabricacao: '', km: '', fabricante_id: '', modelo_id: '', estado_id: '', cidade_id: '', plan_id: '1', categoria_id: ''
    });
    const [images, setImages] = React.useState([]); // New images to upload
    const [existingImages, setExistingImages] = React.useState([]); // Images already on server
    const [previews, setPreviews] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [adId, setAdId] = React.useState(null);

    const [states, setStates] = React.useState([]);
    const [cities, setCities] = React.useState([]);
    const [fabricantes, setFabricantes] = React.useState([]);
    const [modelos, setModelos] = React.useState([]);
    const [categorias, setCategorias] = React.useState([]);
    const [planos, setPlanos] = React.useState([]);

    const previewUrlsRef = React.useRef([]);

    React.useEffect(() => {
        return () => {
            previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    // Initial Data & Ad Fetching
    React.useEffect(() => {
        const hash = window.location.hash;
        const parts = hash.split('/');
        // Expected: #/edit-ad/ID
        if (parts.length >= 3) {
            setAdId(parts[2]);
            fetchAdData(parts[2]);
        }

        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const [st, fab, cat, plan] = await Promise.all([
                api.get('/locations/states'),
                api.get('/resources/fabricantes'),
                api.get('/resources/categorias'),
                api.get('/resources/planos')
            ]);
            setStates(st.data);
            setFabricantes(fab.data);
            setCategorias(cat.data);
            setPlanos(plan.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchAdData = async (id) => {
        try {
            const res = await api.get(`/anuncios/${id}`);
            const ad = res.data;

            // Pre-fill form
            setFormData({
                titulo: ad.titulo,
                descricao: ad.descricao || '',
                preco: parseFloat(ad.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
                ano_fabricacao: ad.ano_fabricacao,
                km: ad.km,
                fabricante_id: ad.fabricante_id,
                modelo_id: ad.modelo_id,
                estado_id: ad.estado_id,
                cidade_id: ad.cidade_id,
                plan_id: '1', // Plan usually can't be changed here easily without payment logic, keeping static for now or ignoring
                categoria_id: ad.categoria_id
            });

            setExistingImages(ad.images || []);

            // Trigger side-effect fetches
            if (ad.estado_id) fetchCities(ad.estado_id);
            if (ad.fabricante_id) fetchModelos(ad.fabricante_id, ad.categoria_id);

            setLoading(false);
        } catch (error) {
            console.error(error);
            alert('Erro ao carregar anúncio.');
            navigateTo('my-ads');
        }
    };

    const fetchCities = (stateId) => {
        api.get(`/locations/cities/${stateId}`)
            .then(res => setCities(res.data || []))
            .catch(console.error);
    };

    const fetchModelos = (fabId, catId) => {
        let url = `/resources/modelos/${fabId}`;
        if (catId) url += `?categoriaId=${catId}`;
        api.get(url)
            .then(res => setModelos(res.data || []))
            .catch(console.error);
    };

    // ... Handlers (handleChange, handleImageChange same as CreateAdPage basically) ...
    const handleChange = (e) => {
        let { name, value } = e.target;
        if (name === 'preco') {
            value = value.replace(/\D/g, "");
            value = (Number(value) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStateChange = (e) => {
        const stateId = e.target.value;
        setFormData(prev => ({ ...prev, estado_id: stateId, cidade_id: '' }));
        if (stateId) fetchCities(stateId);
        else setCities([]);
    };

    const handleFabricanteChange = (e) => {
        const fabId = e.target.value;
        setFormData(prev => ({ ...prev, fabricante_id: fabId, modelo_id: '' }));
        if (fabId) fetchModelos(fabId, formData.categoria_id);
        else setModelos([]);
    };

    const handleCategoriaChange = (e) => {
        const catId = e.target.value;
        setFormData(prev => ({ ...prev, categoria_id: catId, modelo_id: '' }));
        if (formData.fabricante_id) fetchModelos(formData.fabricante_id, catId);
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
                    const MAX_WIDTH = 1024;
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

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = existingImages.length + images.length + files.length;

        if (totalImages > 9) {
            alert('Você pode adicionar no máximo 9 imagens no total.');
            return;
        }

        Promise.all(files.map(file => compressImage(file)))
            .then(compressedFiles => {
                setImages(prev => [...prev, ...compressedFiles]);
                const newPreviews = compressedFiles.map(file => {
                    const url = URL.createObjectURL(file);
                    previewUrlsRef.current.push(url);
                    return url;
                });
                setPreviews(prev => [...prev, ...newPreviews]);
            })
            .catch(console.error);
    };

    const handleRemoveExistingImage = async (imageId) => {
        if (!confirm('Excluir esta foto?')) return;
        try {
            const token = localStorage.getItem('token');
            await api.delete(`/anuncios/${adId}/images/${imageId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setExistingImages(prev => prev.filter(img => img.id !== imageId));
        } catch (err) {
            console.error(err);
            alert('Erro ao excluir imagem.');
        }
    };

    const handleRemoveNewImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        setImages(newImages);
        setPreviews(newPreviews);

        URL.revokeObjectURL(previews[index]);
        const urlRefIndex = previewUrlsRef.current.indexOf(previews[index]);
        if (urlRefIndex > -1) previewUrlsRef.current.splice(urlRefIndex, 1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'plan_id') return; // Skip plan
            if (key === 'preco') {
                let price = formData[key].replace(/[^\d,]/g, '').replace(',', '.');
                data.append(key, price);
            } else {
                data.append(key, formData[key]);
            }
        });

        // Append NEW images only
        images.forEach(image => data.append('images', image));

        const token = localStorage.getItem('token');
        api.put(`/anuncios/${adId}`, data, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(() => {
                alert('Anúncio atualizado com sucesso!');
                navigateTo('my-ads');
            })
            .catch(error => {
                console.error(error);
                const msg = error.response?.data?.error || error.response?.data?.message || 'Erro ao atualizar.';
                alert(msg);
                setLoading(false);
            });
    };

    if (loading) return <div className="p-10 text-center">Carregando...</div>;

    return (
        <div className="max-w-3xl mx-auto bg-white p-5 rounded-2xl shadow-lg border border-gray-100 fade-in">
            <h1 className="text-2xl font-bold mb-4 text-gray-900">Editar Anúncio</h1>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-0.5">Título do Anúncio</label>
                        <input name="titulo" value={formData.titulo} onChange={handleChange} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-0.5">Preço (R$)</label>
                        <input name="preco" type="text" value={formData.preco} onChange={handleChange} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-500 text-3xl font-bold text-green-600" />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <select name="categoria_id" value={formData.categoria_id} onChange={handleCategoriaChange} required className="p-2 border rounded-lg bg-white">
                        <option value="">Categoria</option>
                        {categorias.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                    </select>

                    <select name="fabricante_id" value={formData.fabricante_id} onChange={handleFabricanteChange} required className="p-2 border rounded-lg bg-white">
                        <option value="">Marca</option>
                        {fabricantes.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                    </select>

                    <select name="modelo_id" value={formData.modelo_id} onChange={handleChange} required className="p-2 border rounded-lg bg-white">
                        <option value="">Modelo</option>
                        {modelos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                    </select>

                    <input name="ano_fabricacao" type="number" value={formData.ano_fabricacao} onChange={handleChange} required className="p-2 border rounded-lg" placeholder="Ano" />
                    <input name="km" type="number" value={formData.km} onChange={handleChange} required className="p-2 border rounded-lg" placeholder="KM" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <select name="estado_id" value={formData.estado_id} onChange={handleStateChange} required className="p-2 border rounded-lg bg-white">
                        <option value="">Estado</option>
                        {states.map(state => <option key={state.abbreviation} value={state.abbreviation}>{state.name}</option>)}
                    </select>
                    <select name="cidade_id" value={formData.cidade_id} onChange={handleChange} required className="p-2 border rounded-lg bg-white">
                        <option value="">Cidade</option>
                        {cities.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-0.5">Descrição</label>
                    <textarea name="descricao" rows="3" value={formData.descricao} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-brand-500"></textarea>
                </div>

                {/* Images Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fotos</label>

                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                        <div className="grid grid-cols-4 gap-3 mb-4">
                            {existingImages.map((img) => (
                                <div key={img.id} className="relative aspect-video rounded-lg overflow-hidden border border-gray-200">
                                    <img src={img.image_path} alt="Existente" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => handleRemoveExistingImage(img.id)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow hover:bg-red-700" title="Excluir">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Upload New */}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50">
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
                            <div className="flex-1">
                                <input type="file" multiple max="9" onChange={handleImageChange} className="hidden" id="gallery-upload" accept="image/*" />
                                <label htmlFor="gallery-upload" className="cursor-pointer block h-full">
                                    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-brand-500 hover:shadow-md transition-all h-full flex flex-col items-center justify-center gap-2">
                                        <span className="font-medium text-gray-700">Adicionar da Galeria</span>
                                    </div>
                                </label>
                            </div>
                            <div className="flex-1">
                                <input type="file" multiple max="9" onChange={handleImageChange} className="hidden" id="camera-upload" accept="image/*" capture="environment" />
                                <label htmlFor="camera-upload" className="cursor-pointer block h-full">
                                    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-brand-500 hover:shadow-md transition-all h-full flex flex-col items-center justify-center gap-2">
                                        <span className="font-medium text-gray-700">Adicionar Foto (Câmera)</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {previews.length > 0 && (
                            <div className="grid grid-cols-4 gap-3 mt-4">
                                {previews.map((src, index) => (
                                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-brand-200 ring-2 ring-brand-100">
                                        <img src={src} className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => handleRemoveNewImage(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="text-xs text-gray-400 mt-2">{existingImages.length + images.length}/9 imagens</div>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30">
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
                <button type="button" onClick={() => navigateTo('my-ads')} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 mt-2">
                    Cancelar
                </button>
            </form>
        </div>
    );
};
