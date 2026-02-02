const HomePage = ({ navigateTo, user }) => {
    const [ads, setAds] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [favoritedIds, setFavoritedIds] = React.useState([]);

    // States for filters
    const [fabricantes, setFabricantes] = React.useState([]);
    const [modelos, setModelos] = React.useState([]);
    const [states, setStates] = React.useState([]);
    const [cities, setCities] = React.useState([]);
    const [categorias, setCategorias] = React.useState([]);

    const [showAdvanced, setShowAdvanced] = React.useState(false);

    const [filters, setFilters] = React.useState({
        fabricante_id: '',
        modelo_id: '',
        estado_id: '',
        cidade_id: '',
        categoria_id: ''
    });

    // Fetch initial data
    React.useEffect(() => {
        // ... existing fetches ...
        // Fetch States
        api.get('/locations/states')
            .then(res => setStates(res.data))
            .catch(err => console.error(err));

        // Fetch Fabricantes
        api.get('/resources/fabricantes')
            .then(res => setFabricantes(res.data))
            .catch(err => console.error(err));

        // Fetch Categorias
        api.get('/resources/categorias')
            .then(res => setCategorias(res.data))
            .catch(err => console.error(err));

        // Fetch Favorites if user
        if (user) {
            const token = localStorage.getItem('token');
            api.get('/favorites/ids', { headers: { Authorization: `Bearer ${token}` } })
                .then(res => {
                    if (Array.isArray(res.data)) {
                        setFavoritedIds(res.data.map(id => Number(id)));
                    } else {
                        console.warn('Favorites response is not an array:', res.data);
                        setFavoritedIds([]);
                    }
                })
                .catch(err => console.error("Error fetching favs", err));
        }

        // Check LocalStorage for User Location Plan
        const savedLocation = localStorage.getItem('userLocation');
        if (savedLocation) {
            try {
                const loc = JSON.parse(savedLocation);
                if (loc.stateId) {
                    api.get(`/locations/cities/${loc.stateId}`)
                        .then(res => {
                            setCities(res.data);
                            const initialFilters = {
                                estado_id: loc.stateId,
                                cidade_id: loc.cityId || '',
                                fabricante_id: '',
                                modelo_id: '',
                                categoria_id: ''
                            };
                            setFilters(initialFilters);
                            fetchAds(initialFilters);
                        })
                        .catch(() => {
                            const initialFilters = { estado_id: loc.stateId, cidade_id: '', fabricante_id: '', modelo_id: '', categoria_id: '' };
                            setFilters(initialFilters);
                            fetchAds(initialFilters);
                        });
                } else { detectLocationAndFetchAds(); }
            } catch (e) { detectLocationAndFetchAds(); }
        } else { detectLocationAndFetchAds(); }

    }, [user]);

    const detectLocationAndFetchAds = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();

                    if (data && data.address) {
                        let detectedUf = '';
                        if (data.address['ISO3166-2-lvl4']) {
                            detectedUf = data.address['ISO3166-2-lvl4'].split('-')[1];
                        }

                        const detectedCityName = data.address.city || data.address.town || data.address.village || data.address.municipality;

                        if (detectedUf) {
                            api.get(`/locations/cities/${detectedUf}`)
                                .then(res => {
                                    setCities(res.data);
                                    let matchedCityId = '';
                                    if (detectedCityName) {
                                        const searchName = normalizeText(detectedCityName);
                                        const found = res.data.find(c => normalizeText(c.name) === searchName);
                                        if (found) matchedCityId = found.id;
                                    }

                                    const initialFilters = {
                                        estado_id: detectedUf,
                                        cidade_id: matchedCityId,
                                        fabricante_id: '',
                                        modelo_id: '',
                                        categoria_id: ''
                                    };

                                    localStorage.setItem('userLocation', JSON.stringify({
                                        stateId: detectedUf,
                                        cityId: matchedCityId,
                                        cityName: detectedCityName || ''
                                    }));
                                    window.dispatchEvent(new Event('locationUpdated'));

                                    setFilters(initialFilters);
                                    fetchAds(initialFilters);
                                })
                                .catch(() => fetchAds());
                        } else { fetchAds(); }
                    } else { fetchAds(); }
                } catch (error) { console.error("Error reverse geocoding:", error); fetchAds(); }
            }, (error) => { console.warn("Location permission denied", error); fetchAds(); }, { timeout: 5000 });
        } else { fetchAds(); }
    };

    const fetchAds = (queryParams = {}) => {
        setLoading(true);
        const params = new URLSearchParams();
        Object.keys(queryParams).forEach(key => {
            if (queryParams[key]) params.append(key, queryParams[key]);
        });

        api.get(`/anuncios?${params.toString()}`)
            .then(res => {
                setAds(Array.isArray(res.data) ? res.data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));

        if (name === 'estado_id') {
            setFilters(prev => ({ ...prev, cidade_id: '' }));
            if (value) {
                api.get(`/locations/cities/${value}`).then(res => setCities(res.data)).catch(err => console.error(err));
            } else { setCities([]); }
        }

        if (name === 'fabricante_id') {
            setFilters(prev => ({ ...prev, modelo_id: '' }));
            if (value) {
                const categoriaParam = filters.categoria_id ? `?categoriaId=${filters.categoria_id}` : '';
                api.get(`/resources/modelos/${value}${categoriaParam}`).then(res => setModelos(res.data)).catch(err => console.error(err));
            } else { setModelos([]); }
        }

        if (name === 'categoria_id') {
            setFilters(prev => ({ ...prev, modelo_id: '', fabricante_id: '', [name]: value }));
            const params = value ? `?categoriaId=${value}` : '';
            api.get(`/resources/fabricantes${params}`).then(res => setFabricantes(res.data)).catch(err => console.error(err));
            setModelos([]);
        }
    };

    const handleSearch = () => { fetchAds(filters); };

    const handleToggleFavorite = async (e, adId) => {
        e.stopPropagation();
        e.preventDefault(); // Extra safety

        if (!user) {
            // alert("Você precisa estar logado para favoritar!"); // Optional feedback
            navigateTo('login');
            return;
        }

        const numericId = Number(adId); // Ensure numeric
        // Check using loose equality
        const isFav = favoritedIds.some(id => id == adId);

        // Optimistic
        if (isFav) {
            setFavoritedIds(prev => prev.filter(id => id != adId));
        } else {
            setFavoritedIds(prev => [...prev, adId]);
        }

        try {
            const token = localStorage.getItem('token');
            await api.post('/favorites/toggle', { anuncioId: numericId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Error toggling favorite", error);
            // Revert
            if (isFav) setFavoritedIds(prev => [...prev, numericId]);
            else setFavoritedIds(prev => prev.filter(id => id !== numericId));
        }
    };




    const normalizeText = (text) => {
        return text ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
    };



    return (
        <div className="fade-in w-full px-2 lg:px-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start">

                {/* Main Content Column (Left) */}
                <div className="flex-1 w-full min-w-0">

                    {/* ADMIN SHORTCUT */}
                    {/* ADMIN SHORTCUT */}
                    {/* ADMIN SHORTCUT */}


                    {/* Hero / Filter Section - Mobiauto Style (Compact Version) */}
                    {/* Hero / Filter Section - Mobiauto Style (Compact Version) */}
                    <div className="relative mb-4 px-2 md:px-0">

                        {/* Background Image / Banner - Reduced Height */}
                        <div className="absolute top-0 left-0 w-full h-[140px] z-0 rounded-b-[20px] overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop"
                                alt="Background"
                                className="w-full h-full object-cover brightness-75"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/90"></div>
                        </div>

                        <div className="relative z-10 max-w-5xl mx-auto mt-4">
                            <div className="text-center mb-3">
                                <h2 className="text-xl md:text-2xl font-black text-white drop-shadow-lg leading-tight">
                                    Seu carro novo está aqui.
                                </h2>
                            </div>

                            {/* Search Box Container - Compact */}
                            <div className="bg-white rounded-lg shadow-lg p-3 animate-fade-in-up border border-gray-100 mt-2">

                                {/* Header: Tabs + Quick Categories */}
                                <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-100 pb-2 mb-3 gap-3">

                                    {/* Tabs (Left) */}
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleFilterChange({ target: { name: 'categoria_id', value: '1' } })}
                                            className={`pb-1 border-b-2 font-bold text-sm md:text-base transition-colors ${filters.categoria_id == '1' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                        >
                                            🚗 Comprar Carros
                                        </button>
                                        <button
                                            onClick={() => handleFilterChange({ target: { name: 'categoria_id', value: '2' } })}
                                            className={`pb-1 border-b-2 font-bold text-sm md:text-base transition-colors ${filters.categoria_id == '2' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                        >
                                            🏍️ Comprar Motos
                                        </button>
                                    </div>

                                    {/* Quick Categories (Right) - Integrated */}
                                    <div className="flex gap-3 overflow-x-auto max-w-full pb-1 md:pb-0 hide-scrollbar">
                                        {[
                                            { name: 'Hatch', icon: '🚙' },
                                            { name: 'Sedan', icon: '🚗' },
                                            { name: 'SUV', icon: '🚙' },
                                            { name: 'Picape', icon: '🛻' }
                                        ].map(cat => (
                                            <div key={cat.name} className="flex items-center gap-1 group cursor-pointer opacity-70 hover:opacity-100 transition bg-gray-50 px-2 py-1 rounded-full border border-gray-100 hover:bg-gray-100">
                                                <span className="text-sm">{cat.icon}</span>
                                                <span className="text-[10px] font-bold text-gray-600 uppercase">{cat.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Filters Row - More Horizontal */}
                                <div className="grid grid-cols-2 md:flex md:gap-3 gap-2 items-end mb-2">
                                    <div className="relative w-full">
                                        <select name="fabricante_id" value={filters.fabricante_id} onChange={handleFilterChange} className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5 font-semibold focus:ring-brand-500 focus:border-brand-500">
                                            <option value="">Marca</option>
                                            {fabricantes.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                                        </select>
                                    </div>
                                    <div className="relative w-full">
                                        <select name="modelo_id" value={filters.modelo_id} onChange={handleFilterChange} disabled={!modelos.length} className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5 font-semibold focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50">
                                            <option value="">Modelo</option>
                                            {modelos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                                        </select>
                                    </div>
                                    <div className="relative w-full">
                                        <input type="number" name="minYear" placeholder="Ano Min" onChange={handleFilterChange} className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5 font-semibold" />
                                    </div>
                                    <div className="relative w-full">
                                        <input type="number" name="maxPrice" placeholder="Preço Máx" onChange={handleFilterChange} className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-lg p-2.5 font-semibold" />
                                    </div>

                                    {/* Action Row integrated or close by */}
                                    <div className="col-span-2 md:col-span-auto md:w-auto w-full flex-shrink-0">
                                        <button onClick={handleSearch} className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-6 rounded-lg shadow hover:shadow-lg transition-all transform hover:-translate-y-0.5 text-sm uppercase tracking-wide whitespace-nowrap">
                                            🔍 Buscar
                                        </button>
                                    </div>
                                </div>

                                {/* Advanced Toggle */}
                                <div className="text-center md:text-left">
                                    <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-brand-600 font-semibold text-xs hover:underline">
                                        {showAdvanced ? 'Menos opções' : 'Busca Avançada (Estado, Cidade, Km)'}
                                    </button>
                                </div>

                                {/* Advanced Filters (Conditional) */}
                                {showAdvanced && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 pt-2 border-t border-gray-100 animate-fade-in">
                                        <select name="estado_id" value={filters.estado_id} onChange={handleFilterChange} className="bg-white border border-gray-300 text-gray-700 text-xs rounded p-2">
                                            <option value="">Estado</option>
                                            {states.map(s => <option key={s.abbreviation} value={s.abbreviation}>{s.name}</option>)}
                                        </select>
                                        <select name="cidade_id" value={filters.cidade_id} onChange={handleFilterChange} disabled={!cities.length} className="bg-white border border-gray-300 text-gray-700 text-xs rounded p-2">
                                            <option value="">Cidade</option>
                                            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                        <input type="number" name="maxKm" placeholder="Km Máximo" onChange={handleFilterChange} className="bg-white border border-gray-300 text-gray-700 text-xs rounded p-2" />
                                        <select name="sort" onChange={handleFilterChange} className="bg-white border border-gray-300 text-gray-700 text-xs rounded p-2 font-semibold">
                                            <option value="">Ordenar</option>
                                            <option value="price_asc">Menor Preço</option>
                                            <option value="price_desc">Maior Preço</option>
                                            <option value="km_asc">Menor Km</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Ads Grid */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-1 h-5 bg-brand-500 rounded-full block"></span>
                                Destaques Recentes
                            </h3>
                        </div>

                        {loading ? (
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mb-4"></div>
                                <p className="text-gray-500">Carregando as melhores ofertas...</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {ads.map(ad => {
                                        const isFav = favoritedIds.some(favId => favId == ad.id);
                                        return (
                                            <div key={ad.id} className="relative group/card h-full">
                                                <AdCard
                                                    ad={ad}
                                                    onClick={() => navigateTo('ad-detail', ad.id)}
                                                    isFavorite={isFav}
                                                    onToggleFavorite={handleToggleFavorite}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>

                                {ads.length === 0 && (
                                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                        <span className="text-4xl mb-4 block">🔍</span>
                                        <h3 className="text-lg font-medium text-gray-900">Nenhum veículo encontrado</h3>
                                        <p className="text-gray-500 mt-1">Tente ajustar seus filtros de busca.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Right Sidebar (Ads) */}
                <div className="w-full lg:w-72 shrink-0 space-y-4">
                    <div className="sticky top-4">
                        {/* Using 'sidebar' location to get vertical ads */}
                        <AdBanner location="sidebar" className="w-full h-64 rounded-xl shadow-sm border border-gray-100" />

                        <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-100 hidden lg:block">
                            <h4 className="font-bold text-gray-700 mb-2 text-sm">Anuncie Aqui</h4>
                            <p className="text-xs text-gray-500 mb-3">Aumente suas vendas alcançando milhares de compradores em todo o Brasil.</p>
                            <button className="w-full bg-white border border-brand-200 text-brand-600 font-bold text-xs py-2 rounded-lg hover:bg-brand-50 transition">
                                Ver Planos
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
