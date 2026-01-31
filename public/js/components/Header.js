const Header = ({ user, navigateTo, onLogout }) => {
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    // Location Data
    const [userLocation, setUserLocation] = React.useState(null);
    const [showLocationModal, setShowLocationModal] = React.useState(false);

    // Modal States
    const [states, setStates] = React.useState([]);
    const [cities, setCities] = React.useState([]);
    const [selectedState, setSelectedState] = React.useState('');
    const [selectedCity, setSelectedCity] = React.useState('');
    const [loadingStates, setLoadingStates] = React.useState(false);
    const [loadingCities, setLoadingCities] = React.useState(false);

    React.useEffect(() => {
        // Init User Location
        const loadLocation = () => {
            const saved = localStorage.getItem('userLocation');
            if (saved) {
                try {
                    setUserLocation(JSON.parse(saved));
                } catch (e) { }
            }
        };

        loadLocation();

        // Listen for updates from HomePage
        window.addEventListener('locationUpdated', loadLocation);

        if (!user) return () => window.removeEventListener('locationUpdated', loadLocation);

        // Chat Polling
        const checkUnread = async () => {
            // ... existing chat logic ...
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const response = await fetch('/api/chat/conversations', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const conversations = await response.json();
                    const totalUnread = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
                    setUnreadCount(totalUnread);
                }
            } catch (err) {
                console.error(err);
            }
        };

        checkUnread();
        const interval = setInterval(checkUnread, 15000);
        return () => {
            clearInterval(interval);
            window.removeEventListener('locationUpdated', loadLocation);
        };
    }, [user]);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const openLocationModal = async () => {
        setShowLocationModal(true);
        setIsMenuOpen(false); // Close mobile menu if open
        if (states.length === 0) {
            setLoadingStates(true);
            try {
                const res = await fetch('/api/locations/states');
                if (res.ok) setStates(await res.json());
            } catch (e) { console.error(e); }
            setLoadingStates(false);
        }
    };

    const handleStateChange = async (e) => {
        const stateAbbr = e.target.value; // Store Abbreviation directly
        setSelectedState(stateAbbr);
        setSelectedCity('');
        setCities([]);

        if (stateAbbr) {
            setLoadingCities(true);
            try {
                const res = await fetch(`/api/locations/cities/${stateAbbr}`);
                if (res.ok) setCities(await res.json());
            } catch (e) { console.error(e); }
            setLoadingCities(false);
        }
    };

    const handleSaveLocation = () => {
        if (!selectedState || !selectedCity) {
            alert("Selecione estado e cidade");
            return;
        }
        const stateObj = states.find(s => s.abbreviation == selectedState);
        const cityObj = cities.find(c => c.id == selectedCity);

        const newLoc = {
            state: stateObj ? stateObj.name : '',
            stateId: selectedState,
            city: cityObj ? cityObj.name : '',
            cityId: selectedCity
        };

        localStorage.setItem('userLocation', JSON.stringify(newLoc));
        setUserLocation(newLoc);
        setShowLocationModal(false);
        window.location.reload(); // Refresh to update Home Page filters
    };

    // Helper to get location string
    // Check for both 'city' (manual save) and 'cityName' (auto detect save)
    const locationDisplay = userLocation
        ? `${userLocation.city || userLocation.cityName || 'Local'} - ${userLocation.stateId || userLocation.state}`
        : "Selecionar Localização";

    return (
        <header className="bg-sky-500 shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div
                    className="flex items-center cursor-pointer group"
                    onClick={() => navigateTo('home')}
                >
                    {/* Modern Icon with Gradient */}
                    <div className="relative mr-2.5">
                        <div className="absolute inset-0 bg-white/20 rounded-xl transform rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
                        <div className="relative bg-white text-sky-500 border-2 border-transparent rounded-xl p-1.5 shadow-sm group-hover:-translate-y-0.5 transition-transform duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                            </svg>
                        </div>
                    </div>

                    {/* Typography */}
                    <div className="flex flex-col justify-center -space-y-1">
                        <span className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-blue-100 uppercase leading-none ml-0.5 opacity-90">Paracuru</span>
                        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tighter leading-none italic drop-shadow-sm">
                            VEÍCULOS<span className="text-amber-400">.</span>
                        </h1>
                    </div>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-6">
                    <button onClick={openLocationModal} className="flex items-center text-white/90 hover:text-white font-medium transition text-sm bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20">
                        <svg className="w-4 h-4 mr-1 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        {locationDisplay}
                    </button>
                    <button onClick={() => navigateTo('favorites')} className="text-white hover:text-amber-300 font-medium transition text-sm">
                        Favoritos
                    </button>
                    <button onClick={() => user ? navigateTo('create-ad') : navigateTo('login')} className="text-white hover:text-amber-300 font-medium transition text-sm">
                        Anunciar
                    </button>

                    {user?.isAdmin && (
                        <button onClick={() => navigateTo('admin')} className="text-amber-300 hover:text-amber-200 font-bold transition text-sm bg-black/20 px-3 py-1 rounded-full">
                            Painel Admin
                        </button>
                    )}
                    {user ? (
                        <div className="flex items-center space-x-4 ml-4">
                            <button onClick={() => navigateTo('inbox')} className="relative text-white hover:text-amber-300 font-medium transition text-sm mr-2">
                                Mensagens
                                {unreadCount > 0 && (
                                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm border border-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            <button onClick={() => navigateTo('my-ads')} className="text-white hover:text-amber-300 font-medium transition text-sm">
                                Meus Anúncios
                            </button>
                            <button onClick={() => navigateTo('profile')} className="text-white hover:text-amber-300 font-medium transition text-sm">
                                Meu Perfil
                            </button>
                            <span className="text-blue-100 text-sm font-medium">Olá, {user.nome || user.name}</span>
                            <button onClick={onLogout} className="border border-white/40 text-white hover:bg-white/10 px-3 py-1.5 rounded-full font-medium transition text-xs">
                                Sair
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-4 ml-4">
                            <button onClick={() => navigateTo('login')} className="bg-amber-500 text-white px-5 py-2 rounded-full font-bold hover:bg-amber-600 transition shadow-lg shadow-amber-500/30 text-sm transform hover:-translate-y-0.5">
                                Entrar
                            </button>
                        </div>
                    )}
                </nav>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center">
                    {user && (
                        <button onClick={() => navigateTo('inbox')} className="relative mr-4 text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[15px] text-center border border-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    )}
                    <button onClick={toggleMenu} className="text-white focus:outline-none">
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 py-2 px-4 shadow-lg absolute w-full left-0 animate-fade-in-down z-50 rounded-b-xl">
                    <div className="flex flex-col space-y-3">
                        {user && <div className="text-sm font-semibold text-gray-800 pb-2 border-b">Olá, {user.nome || user.name}</div>}

                        <button onClick={openLocationModal} className="text-left text-gray-600 py-2 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            {locationDisplay}
                        </button>

                        <button onClick={() => { navigateTo('favorites'); toggleMenu(); }} className="text-left text-gray-600 py-2">Favoritos</button>
                        <button onClick={() => { user ? navigateTo('create-ad') : navigateTo('login'); toggleMenu(); }} className="text-left text-gray-600 py-2">Anunciar</button>
                        {user?.isAdmin && (
                            <button onClick={() => { navigateTo('admin'); toggleMenu(); }} className="text-left text-red-900 font-bold py-2">Painel Admin</button>
                        )}

                        {user ? (
                            <>
                                <button onClick={() => { navigateTo('inbox'); toggleMenu(); }} className="text-left text-gray-600 py-2 flex justify-between items-center">
                                    Mensagens
                                    {unreadCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>}
                                </button>
                                <button onClick={() => { navigateTo('my-ads'); toggleMenu(); }} className="text-left text-gray-600 py-2">Meus Anúncios</button>
                                <button onClick={() => { navigateTo('profile'); toggleMenu(); }} className="text-left text-gray-600 py-2">Meu Perfil</button>
                                <button onClick={() => { onLogout(); toggleMenu(); }} className="text-left text-red-600 py-2 font-medium">Sair</button>
                            </>
                        ) : (
                            <button onClick={() => { navigateTo('login'); toggleMenu(); }} className="text-left text-sky-600 font-bold py-2">Entrar</button>
                        )}
                    </div>
                </div>
            )}

            {/* Location Modal */}
            {showLocationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Escolha sua localização</h3>
                            <button onClick={() => setShowLocationModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    value={selectedState}
                                    onChange={handleStateChange}
                                >
                                    <option value="">{loadingStates ? 'Carregando' : 'Selecione...'}</option>
                                    {states.map(s => <option key={s.abbreviation} value={s.abbreviation}>{s.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    disabled={!selectedState}
                                >
                                    <option value="">{loadingCities ? 'Carregando...' : 'Selecione...'}</option>
                                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <button
                                onClick={handleSaveLocation}
                                className="w-full bg-brand-600 text-white py-2 rounded-lg font-bold hover:bg-brand-700 transition"
                            >
                                Confirmar e Filtrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};
