const FavoritesPage = ({ navigateTo, user }) => {
    const [ads, setAds] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!user) {
            navigateTo('login');
            return;
        }

        const fetchFavorites = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/favorites', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setAds(data);
                }
            } catch (error) {
                console.error("Error fetching favorites:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, [user]);

    const handleRemoveFavorite = async (adId, e) => {
        e.stopPropagation();
        if (!confirm("Remover dos favoritos?")) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/favorites/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ anuncioId: adId })
            });

            if (response.ok) {
                // Remove from local state
                setAds(prev => prev.filter(ad => ad.id !== adId));
            }

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="fade-in">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-red-100 text-red-600 p-2 rounded-lg mr-3">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
                </span>
                Meus Favoritos
            </h1>

            {loading ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mb-4"></div>
                    <p className="text-gray-500">Carregando favoritos...</p>
                </div>
            ) : ads.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                    <div className="text-6xl mb-4">💔</div>
                    <h3 className="text-xl font-medium text-gray-900">Nenhum favorito ainda</h3>
                    <p className="text-gray-500 mt-2 mb-6">Explore os anúncios e salve seus carros preferidos.</p>
                    <button onClick={() => navigateTo('home')} className="bg-brand-600 text-white px-6 py-2 rounded-lg hover:bg-brand-700 transition">
                        Ver Anúncios
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {ads.map(ad => (
                        <div key={ad.id} className="relative">
                            <AdCard ad={ad} onClick={() => navigateTo('ad-detail', ad.id)} />
                            <button
                                onClick={(e) => handleRemoveFavorite(ad.id, e)}
                                className="absolute top-2 right-2 bg-white text-red-500 p-2 rounded-full shadow-md hover:bg-red-50 transition z-10"
                                title="Remover dos favoritos"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
