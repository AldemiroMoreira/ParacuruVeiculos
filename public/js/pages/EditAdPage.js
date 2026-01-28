const EditAdPage = ({ user, navigateTo }) => {
    // Get ID from hash
    const getAdId = () => {
        const hash = window.location.hash;
        const parts = hash.split('/edit-ad/');
        return parts.length > 1 ? parts[1] : null;
    };

    const [adId, setAdId] = React.useState(getAdId());
    const [formData, setFormData] = React.useState({
        titulo: '', descricao: '', preco: '', ano_fabricacao: '', km: '', fabricante_id: '', modelo_id: '', estado_id: '', cidade_id: '', plan_id: '1', categoria_id: ''
    });
    const [images, setImages] = React.useState([]); // New images to upload
    const [existingImages, setExistingImages] = React.useState([]); // Existing images from DB
    const [previews, setPreviews] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);

    // Dropdowns
    const [states, setStates] = React.useState([]);
    const [cities, setCities] = React.useState([]);
    const [fabricantes, setFabricantes] = React.useState([]);
    const [modelos, setModelos] = React.useState([]);
    const [categorias, setCategorias] = React.useState([]);
    const [planos, setPlanos] = React.useState([]); // Not really used for edit, but maybe for upgrade?

    const previewUrlsRef = React.useRef([]);

    React.useEffect(() => {
        return () => {
            previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    // Initial Fetch
    React.useEffect(() => {
        const id = getAdId();
        if (!id) {
            alert("Anúncio não especificado.");
            navigateTo('my-ads');
            return;
        }
        setAdId(id);

        Promise.all([
            api.get('/locations/states'),
            api.get('/resources/fabricantes'),
            api.get('/resources/categorias'),
            api.get('/resources/planos'),
            api.get(`/anuncios/${id}`) // Fetch Ad Data
        ]).then(([resStates, resFabs, resCats, resPlans, resAd]) => {
            setStates(resStates.data);
            setFabricantes(resFabs.data);
            setCategorias(resCats.data);
            setPlanos(resPlans.data);

            const ad = resAd.data;
            // Verify ownership
            if (user && ad.usuario_id !== user.id && !user.isAdmin) {
                alert("Você não tem permissão para editar este anúncio.");
                navigateTo('my-ads');
                return;
            }

            // Populate Form
            setFormData({
                titulo: ad.titulo,
                descricao: ad.descricao || '',
                preco: parseFloat(ad.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                ano_fabricacao: ad.ano_fabricacao,
                km: ad.km,
                fabricante_id: ad.fabricante_id,
                modelo_id: ad.modelo_id,
                estado_id: ad.State?.abbreviation || ad.estado_id, // Ensure we get ID/Abbr correct
                cidade_id: ad.cidade_id,
                categoria_id: ad.categoria_id,
                plan_id: ad.plan_id // Usually can't change plan on edit easily without payment logic
            });

            setExistingImages(ad.images || []);

            // Trigger Dependent Fetches
            if (ad.estado_id || ad.State?.abbreviation) {
                api.get(`/locations/cities/${ad.State?.abbreviation || ad.estado_id}`).then(r => setCities(r.data));
            }
            if (ad.fabricante_id) {
                const url = `/resources/modelos/${ad.fabricante_id}?categoriaId=${ad.categoria_id || ''}`;
                api.get(url).then(r => setModelos(r.data));
            }

            setLoading(false);
        }).catch(err => {
            console.error(err);
            alert("Erro ao carregar dados do anúncio.");
            setLoading(false);
        });
    }, [user, navigateTo]); // WARNING: check deps

    const handleChange = (e) => {
        let { name, value } = e.target;
        if (name === 'preco') {
            value = value.replace(/\D/g, "");
            value = (Number(value) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoriaChange = (e) => {
        const catId = e.target.value;
        setFormData(prev => ({ ...prev, categoria_id: catId, modelo_id: '' }));
        if (formData.fabricante_id) {
            api.get(`/resources/modelos/${formData.fabricante_id}?categoriaId=${catId}`).then(r => setModelos(r.data));
        }
    };

    const handleFabricanteChange = (e) => {
        const fabId = e.target.value;
        setFormData(prev => ({ ...prev, fabricante_id: fabId, modelo_id: '' }));
        if (fabId) {
            api.get(`/resources/modelos/${fabId}?categoriaId=${formData.categoria_id || ''}`).then(r => setModelos(r.data));
        } else {
            setModelos([]);
        }
    };

    const handleStateChange = (e) => {
        const stateId = e.target.value;
        setFormData(prev => ({ ...prev, estado_id: stateId, cidade_id: '' }));
        if (stateId) {
            api.get(`/locations/cities/${stateId}`).then(r => setCities(r.data));
        } else {
            setCities([]);
        }
    };

    // Standard Image Compression (Same as CreateAd)
    const compressImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1024; const MAX_HEIGHT = 1024;
                    let width = img.width; let height = img.height;

                    if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } }
                    else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }

                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                    }, 'image/jpeg', 0.7);
                };
            };
        });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        // Check total limit (Existing + New)
        const totalImages = existingImages.length + images.length + files.length;
        if (totalImages > 9) {
            alert(`Limite de 9 imagens excedido. Você já tem ${existingImages.length + images.length} e tentou adicionar ${files.length}.`);
            return;
        }

        Promise.all(files.map(compressImage)).then(compressed => {
            setImages(prev => [...prev, ...compressed]);
            const newPreviews = compressed.map(f => {
                const url = URL.createObjectURL(f);
                previewUrlsRef.current.push(url);
                return url;
            });
            setPreviews(prev => [...prev, ...newPreviews]);
        });
    };

    const handleDeleteExistingImage = async (imageId) => {
        if (!confirm("Excluir esta imagem permanentemente?")) return;
        try {
            const token = localStorage.getItem('token');
            await api.delete(`/anuncios/${adId}/images/${imageId}`, { headers: { Authorization: `Bearer ${token}` } });
            setExistingImages(prev => prev.filter(img => img.id !== imageId));
        } catch (err) {
            alert("Erro ao excluir imagem: " + (err.response?.data?.error || err.message));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaving(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'preco') {
                let price = formData[key].replace(/[^\d,]/g, '').replace(',', '.');
                data.append(key, price);
            } else {
                data.append(key, formData[key] || '');
            }
        });

        // Append NEW images
        images.forEach(img => data.append('images', img));

        const token = localStorage.getItem('token');
        api.put(`/anuncios/${adId}`, data, { headers: { Authorization: `Bearer ${token}` } })
            .then(() => {
                alert("Anúncio atualizado com sucesso!");
                navigateTo('my-ads');
            })
            .catch(err => {
                console.error(err);
                alert("Erro ao atualizar: " + (err.response?.data?.error || err.message));
                setSaving(false);
            });
    };

    if (loading) return <div className="text-center p-10">Carregando dados...</div>;

    return (
        <div className="max-w-3xl mx-auto bg-white p-5 rounded-2xl shadow-lg border border-gray-100 fade-in">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Editar Anúncio</h1>
                <button onClick={() => navigateTo('my-ads')} className="text-gray-500 hover:text-gray-700">Cancelar</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-0.5">Título</label>
                        <input name="titulo" value={formData.titulo} onChange={handleChange} required className="w-full p-2 border rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-0.5">Preço (R$)</label>
                        <input name="preco" value={formData.preco} onChange={handleChange} required className="w-full p-2 border rounded-lg font-bold text-green-600" />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <select name="categoria_id" value={formData.categoria_id} onChange={handleCategoriaChange} required className="p-2 border rounded-lg">
                        <option value="">Categoria</option>
                        {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                    <select name="fabricante_id" value={formData.fabricante_id} onChange={handleFabricanteChange} required className="p-2 border rounded-lg">
                        <option value="">Marca</option>
                        {fabricantes.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                    </select>
                    <select name="modelo_id" value={formData.modelo_id} onChange={handleChange} required className="p-2 border rounded-lg">
                        <option value="">Modelo</option>
                        {modelos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                    </select>

                    <input name="ano_fabricacao" type="number" value={formData.ano_fabricacao} onChange={handleChange} required className="p-2 border rounded-lg" placeholder="Ano" />
                    <input name="km" type="number" value={formData.km} onChange={handleChange} required className="p-2 border rounded-lg" placeholder="KM" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <select name="estado_id" value={formData.estado_id} onChange={handleStateChange} required className="p-2 border rounded-lg">
                        <option value="">Estado</option>
                        {states.map(s => <option key={s.abbreviation} value={s.abbreviation}>{s.name}</option>)}
                    </select>
                    <select name="cidade_id" value={formData.cidade_id} onChange={handleChange} required className="p-2 border rounded-lg">
                        <option value="">Cidade</option>
                        {cities.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-0.5">Descrição</label>
                    <textarea name="descricao" rows="3" value={formData.descricao} onChange={handleChange} className="w-full p-2 border rounded-lg"></textarea>
                </div>

                {/* IMAGES SECTION */}
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Imagens</label>

                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-2">Imagens Atuais:</p>
                            <div className="grid grid-cols-4 gap-2">
                                {existingImages.map(img => (
                                    <div key={img.id} className="relative aspect-square group">
                                        <img src={img.image_path || img.url} alt="Existing" className="w-full h-full object-cover rounded shadow-sm" />
                                        <button type="button" onClick={() => handleDeleteExistingImage(img.id)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upload New */}
                    <div className="flex gap-4 mb-2">
                        <label className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            Adicionar Fotos
                            <input type="file" multiple max="9" onChange={handleImageChange} className="hidden" accept="image/*" />
                        </label>
                    </div>

                    {/* New Previews */}
                    {previews.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-2">
                            {previews.map((src, idx) => (
                                <div key={idx} className="relative aspect-square">
                                    <img src={src} className="w-full h-full object-cover rounded border border-blue-200" />
                                    <button type="button" onClick={() => {
                                        setImages(i => i.filter((_, x) => x !== idx));
                                        setPreviews(p => p.filter((_, x) => x !== idx));
                                        // Revoke logic omitted for brevity here
                                    }} className="absolute top-1 right-1 bg-gray-800 text-white rounded-full p-1 shadow">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button type="submit" disabled={saving} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-md">
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </form>
        </div>
    );
};
