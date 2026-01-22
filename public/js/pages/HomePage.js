const HomePage = ({ navigateTo, user }) => {
    const [ads, setAds] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [favoritedIds, setFavoritedIds] = React.useState([]);

    // States for filters
    const [fabricantes, setFabricantes] = React.useState([]);
    const [modelos, setModelos] = React.useState([]);
    const [states, setStates] = React.useState([]);
    const [cities, setCities] = React.useState([]);
    const [especies, setEspecies] = React.useState([]);

    const [filters, setFilters] = React.useState({
        fabricante_id: '',
        modelo_id: '',
        modelo_id: '',
        estado_id: '',
        cidade_id: '',
        especie_id: ''
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

        // Fetch Especies
        api.get('/resources/especies')
            .then(res => setEspecies(res.data))
            .catch(err => console.error(err));

        // Fetch Favorites if user
        if (user) {
            const token = localStorage.getItem('token');
            api.get('/favorites/ids', { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setFavoritedIds(res.data))
                .catch(err => console.error("Error fetching favs", err));
        }

        // Check LocalStorage for User Location Plan
        // ... existing ... 

        // (Just keeping the original structure for detectLocation...)
        const savedLocation = localStorage.getItem('userLocation');
        // ... (rest of useEffect logic remains same, I am just injecting the favorites fetch above)

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
                                especie_id: ''
                            };
                            setFilters(initialFilters);
                            fetchAds(initialFilters);
                        })
                        .catch(() => {
                            const initialFilters = { estado_id: loc.stateId, cidade_id: '', fabricante_id: '', modelo_id: '', especie_id: '' };
                            setFilters(initialFilters);
                            fetchAds(initialFilters);
                        });
                } else { detectLocationAndFetchAds(); }
            } catch (e) { detectLocationAndFetchAds(); }
        } else { detectLocationAndFetchAds(); }

    }, [user]); // Add user to dependency array to refetch favs on login

    // ... detectLocationAndFetchAds, fetchAds, handleFilterChange, handleSearch ...

    const handleToggleFavorite = async (e, adId) => {
        e.stopPropagation();
        if (!user) {
            navigateTo('login');
            return;
        }

        // Optimistic UI update
        const isFav = favoritedIds.includes(adId);
        if (isFav) {
            setFavoritedIds(prev => prev.filter(id => id !== adId));
        } else {
            setFavoritedIds(prev => [...prev, adId]);
        }

        try {
            const token = localStorage.getItem('token');
            await api.post('/favorites/toggle', { anuncioId: adId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Error toggling favorite", error);
            // Revert on error
            if (isFav) setFavoritedIds(prev => [...prev, adId]);
            else setFavoritedIds(prev => prev.filter(id => id !== adId));
        }
    };

    // ... return ...

    // Ads Grid replacement
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {ads.map(ad => {
            const isFav = favoritedIds.includes(ad.id);
            return (
                <div key={ad.id} className="relative group/card">
                    <AdCard ad={ad} onClick={() => navigateTo('ad-detail', ad.id)} />
                    <button
                        onClick={(e) => handleToggleFavorite(e, ad.id)}
                        className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition z-10 ${isFav ? 'bg-white text-red-500' : 'bg-white/80 text-gray-400 hover:text-red-500'}`}
                        title={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    >
                        <svg className="w-5 h-5" fill={isFav ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                </div>
            );
        })}
    </div>

    const normalizeText = (text) => {
        return text ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
    };

    const detectLocationAndFetchAds = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    // OpenStreetMap Nominatim for Reverse Geocoding
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();

                    if (data && data.address) {
                        // Extract state code (ISO3166-2-lvl4 format is usually 'BR-XX')
                        let detectedUf = '';
                        if (data.address['ISO3166-2-lvl4']) {
                            detectedUf = data.address['ISO3166-2-lvl4'].split('-')[1];
                        }

                        // Extract city name
                        const detectedCityName = data.address.city || data.address.town || data.address.village || data.address.municipality;

                        if (detectedUf) {
                            // Fetch cities for this state to find the matching city ID
                            api.get(`/locations/cities/${detectedUf}`)
                                .then(res => {
                                    const loadedCities = res.data;
                                    setCities(loadedCities);

                                    let matchedCityId = '';
                                    if (detectedCityName) {
                                        // Robust matching ignoring accents and case
                                        const searchName = normalizeText(detectedCityName);
                                        const found = loadedCities.find(c => normalizeText(c.name) === searchName);
                                        if (found) matchedCityId = found.id;
                                    }

                                    const initialFilters = {
                                        estado_id: detectedUf,
                                        cidade_id: matchedCityId,
                                        fabricante_id: '',
                                        modelo_id: '',
                                        especie_id: ''
                                    };

                                    // Persist to localStorage so it loads next time
                                    localStorage.setItem('userLocation', JSON.stringify({
                                        stateId: detectedUf,
                                        cityId: matchedCityId,
                                        cityName: detectedCityName || ''
                                    }));

                                    // Notify Header to update
                                    window.dispatchEvent(new Event('locationUpdated'));

                                    setFilters(initialFilters);
                                    fetchAds(initialFilters);
                                })
                                .catch(() => fetchAds());
                        } else {
                            fetchAds();
                        }
                    } else {
                        fetchAds();
                    }
                } catch (error) {
                    console.error("Error reverse geocoding:", error);
                    fetchAds();
                }
            }, (error) => {
                console.warn("Location permission denied or error:", error);
                fetchAds();
            }, { timeout: 5000 });
        } else {
            fetchAds();
        }
    };

    const fetchAds = (queryParams = {}) => {
        setLoading(true);
        // Build query string
        const params = new URLSearchParams();
        Object.keys(queryParams).forEach(key => {
            if (queryParams[key]) params.append(key, queryParams[key]);
        });

        // Log filters being sent
        console.log("Fetching ads with filters:", queryParams);

        api.get(`/anuncios?${params.toString()}`)
            .then(res => {
                if (Array.isArray(res.data)) {
                    setAds(res.data);
                } else {
                    setAds([]);
                }
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
            setFilters(prev => ({ ...prev, cidade_id: '' })); // Reset city
            if (value) {
                api.get(`/locations/cities/${value}`)
                    .then(res => setCities(res.data))
                    .catch(err => console.error(err));
            } else {
                setCities([]);
            }
        }

        if (name === 'fabricante_id') {
            setFilters(prev => ({ ...prev, modelo_id: '' })); // Reset model
            if (value) {
                const especieParam = filters.especie_id ? `?especieId=${filters.especie_id}` : '';
                api.get(`/resources/modelos/${value}${especieParam}`)
                    .then(res => setModelos(res.data))
                    .catch(err => console.error(err));
            } else {
                setModelos([]);
            }
        }

        if (name === 'especie_id') {
            setFilters(prev => ({ ...prev, modelo_id: '', [name]: value })); // Reset model when species changes
            if (filters.fabricante_id) {
                // If manufacturer is selected, refetch models for this NEW species
                const especieParam = value ? `?especieId=${value}` : '';
                api.get(`/resources/modelos/${filters.fabricante_id}${especieParam}`)
                    .then(res => setModelos(res.data))
                    .catch(err => console.error(err));
            }
        }
    };

    const handleSearch = () => {
        fetchAds(filters);
    };

    return (
        <div className="fade-in w-full px-2 lg:px-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start">

                {/* Main Content Column (Left) */}
                <div className="flex-1 w-full min-w-0">

                    {/* Hero / Filter Section - Ultra Compact */}
                    <div className="bg-brand-900 rounded-xl p-3 mb-4 text-white bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center relative overflow-hidden shadow-md">
                        <div className="absolute inset-0 bg-black/60"></div>
                        <div className="relative z-10 max-w-5xl mx-auto text-center py-3">
                            <h2 className="text-xl md:text-2xl font-bold mb-1">Encontre seu próximo veículo</h2>
                            <p className="text-gray-300 mb-3 text-xs">As melhores ofertas de Paracuru e região.</p>

                            <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-lg border border-white/10 grid grid-cols-2 md:grid-cols-5 gap-1.5">
                                <select
                                    name="especie_id"
                                    value={filters.especie_id}
                                    onChange={handleFilterChange}
                                    className="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded shadow-sm focus:ring-brand-500 focus:border-brand-500 block w-full p-1.5"
                                >
                                    <option value="">Espécie (Todas)</option>
                                    {especies.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                                </select>
                                <select
                                    name="fabricante_id"
                                    value={filters.fabricante_id}
                                    onChange={handleFilterChange}
                                    className="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded shadow-sm focus:ring-brand-500 focus:border-brand-500 block w-full p-1.5"
                                >
                                    <option value="">Marca (Todas)</option>
                                    {fabricantes.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                                </select>
                                <select
                                    name="modelo_id"
                                    value={filters.modelo_id}
                                    onChange={handleFilterChange}
                                    disabled={!modelos.length}
                                    className="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded shadow-sm focus:ring-brand-500 focus:border-brand-500 block w-full p-1.5 disabled:opacity-50"
                                >
                                    <option value="">Modelo (Todos)</option>
                                    {modelos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                                </select>
                                <select
                                    name="estado_id"
                                    value={filters.estado_id}
                                    onChange={handleFilterChange}
                                    className="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded shadow-sm focus:ring-brand-500 focus:border-brand-500 block w-full p-1.5"
                                >
                                    <option value="">Estado (Todos)</option>
                                    {states.map(s => <option key={s.abbreviation} value={s.abbreviation}>{s.name}</option>)}
                                </select>
                                <select
                                    name="cidade_id"
                                    value={filters.cidade_id}
                                    onChange={handleFilterChange}
                                    disabled={!cities.length}
                                    className="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded shadow-sm focus:ring-brand-500 focus:border-brand-500 block w-full p-1.5 disabled:opacity-50"
                                >
                                    <option value="">Cidade (Todas)</option>
                                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="mt-2 text-center w-full flex justify-center">
                                <button onClick={handleSearch} className="w-full md:w-auto min-w-[200px] text-white bg-brand-600 hover:bg-brand-700 shadow-md hover:shadow-brand-500/30 font-bold rounded text-xs py-2 px-6 transition-colors">
                                    Buscar Ofertas
                                </button>
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
                                        const isFav = favoritedIds.includes(ad.id);
                                        return (
                                            <div key={ad.id} className="relative group/card">
                                                <AdCard ad={ad} onClick={() => navigateTo('ad-detail', ad.id)} />
                                                <button
                                                    onClick={(e) => handleToggleFavorite(e, ad.id)}
                                                    className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition z-10 ${isFav ? 'bg-white text-red-500' : 'bg-white/80 text-gray-400 hover:text-red-500'}`}
                                                    title={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                                                >
                                                    <svg className="w-5 h-5" fill={isFav ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                </button>
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
                            <p className="text-xs text-gray-500 mb-3">Aumente suas vendas alcançando milhares de compradores em Paracuru.</p>
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
