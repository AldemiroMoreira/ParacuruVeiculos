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
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                <div
                    className="flex items-center cursor-pointer"
                    onClick={() => navigateTo('home')}
                >
                    <div className="bg-brand-600 text-white p-1.5 rounded-lg mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 14h16v2h-16v-2zm1-5l2-4h10l2 4h-14zm0 5v4h2v-4h-2zm12 0v4h2v-4h-2z M6 16a2 2 0 100 4 2 2 0 000-4zm12 0a2 2 0 100 4 2 2 0 000-4z" />
                        </svg>
                    </div>
                    <h1 className="text-lg font-bold text-gray-800 tracking-tight">
                        Paracuru<span className="text-brand-600">Veículos</span>
                    </h1>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-6">
                    <button onClick={openLocationModal} className="flex items-center text-gray-600 hover:text-brand-600 font-medium transition text-sm">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        {locationDisplay}
                    </button>
                    <button onClick={() => navigateTo('favorites')} className="text-gray-600 hover:text-brand-600 font-medium transition text-sm">
                        Favoritos
                    </button>
                    <button onClick={() => user ? navigateTo('create-ad') : navigateTo('login')} className="text-gray-600 hover:text-brand-600 font-medium transition text-sm">
                        Anunciar
                    </button>

                    {user?.isAdmin && (
                        <button onClick={() => navigateTo('admin')} className="text-red-900 hover:text-red-700 font-bold transition text-sm">
                            Painel Admin
                        </button>
                    )}
                    {user ? (
                        <div className="flex items-center space-x-4 ml-4">
                            <button onClick={() => navigateTo('inbox')} className="relative text-gray-600 hover:text-brand-600 font-medium transition text-sm mr-2">
                                Mensagens
                                {unreadCount > 0 && (
                                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            <button onClick={() => navigateTo('my-ads')} className="text-gray-600 hover:text-brand-600 font-medium transition text-sm">
                                Meus Anúncios
                            </button>
                            <button onClick={() => navigateTo('profile')} className="text-gray-600 hover:text-brand-600 font-medium transition text-sm">
                                Meu Perfil
                            </button>
                            <span className="text-gray-700 text-sm">Olá, {user.nome || user.name}</span>
                            <button onClick={onLogout} className="border border-brand-600 text-brand-600 hover:bg-brand-50 px-3 py-1.5 rounded-full font-medium transition text-xs">
                                Sair
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-4 ml-4">
                            <button onClick={() => navigateTo('login')} className="bg-brand-600 text-white px-4 py-1.5 rounded-full font-medium hover:bg-brand-700 transition shadow-lg shadow-brand-500/30 text-sm">
                                Entrar
                            </button>
                        </div>
                    )}
                </nav>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center">
                    {user && (
                        <button onClick={() => navigateTo('inbox')} className="relative mr-4 text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[15px] text-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    )}
                    <button onClick={toggleMenu} className="text-gray-600 focus:outline-none">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <div className="md:hidden bg-white border-t border-gray-100 py-2 px-4 shadow-lg absolute w-full left-0 animate-fade-in-down">
                    <div className="flex flex-col space-y-3">
                        {user && <div className="text-sm font-semibold text-gray-800 pb-2 border-b">Olá, {user.nome || user.name}</div>}

                        <button onClick={openLocationModal} className="text-left text-gray-600 py-2 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
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
                            <button onClick={() => { navigateTo('login'); toggleMenu(); }} className="text-left text-brand-600 font-bold py-2">Entrar</button>
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
