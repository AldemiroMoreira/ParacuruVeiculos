const MyAdsPage = ({ user, navigateTo }) => {
    const [ads, setAds] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [statusMsg, setStatusMsg] = React.useState('');

    React.useEffect(() => {
        // Check URL params for status message
        const params = new URLSearchParams(window.location.hash.split('?')[1]);
        const status = params.get('status');
        if (status === 'success') setStatusMsg('Pagamento aprovado com sucesso! Seu anúncio estará visível em breve.');
        if (status === 'pending') setStatusMsg('Pagamento em análise. Assim que aprovado, seu anúncio será publicado.');
        if (status === 'failure') setStatusMsg('Houve um problema com o pagamento. Tente novamente.');

        fetchMyAds();
    }, []);

    const fetchMyAds = () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        api.get('/anuncios/meus', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                setAds(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    if (loading) return <div className="text-center p-8">Carregando seus anúncios...</div>;

    return (
        <div className="max-w-4xl mx-auto fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Meus Anúncios</h2>
                <button onClick={() => navigateTo('create-ad')} className="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-700">
                    Novo Anúncio
                </button>
            </div>

            {statusMsg && (
                <div className={`mb-6 p-4 rounded-lg flex justify-between items-center ${statusMsg.includes('sucesso') ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'}`}>
                    <span className="font-medium">{statusMsg}</span>
                    <button onClick={() => setStatusMsg('')} className="text-sm font-bold opacity-75 hover:opacity-100">&times;</button>
                </div>
            )}

            {ads.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-gray-500 mb-4">Você ainda não tem anúncios cadastrados.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {ads.map(ad => (
                        <div key={ad.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                            <div className="w-full md:w-32 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                {ad.imagens && ad.imagens.length > 0 ? (
                                    <img src={ad.imagens[0]} alt={ad.titulo} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                )}
                            </div>
                            <div className="flex-grow text-center md:text-left">
                                <h3 className="font-bold text-gray-900 text-lg">{ad.titulo}</h3>
                                <div className="text-sm text-gray-500 mb-1">
                                    {ad.ano_fabricacao} • {parseFloat(ad.km).toLocaleString()} km
                                </div>
                                <div className="font-bold text-brand-600">
                                    R$ {parseFloat(ad.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 min-w-[140px]">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold text-center ${ad.status === 'active' ? 'bg-green-100 text-green-700' :
                                    ad.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {ad.status === 'pending_payment' ? 'Pagamento Pendente' :
                                        ad.status === 'active' ? 'Ativo' :
                                            ad.status === 'sold' ? 'Vendido' : 'Inativo'}
                                </span>
                                {ad.status === 'pending_payment' && (
                                    <button onClick={() => navigateTo('checkout', { adId: ad.id, planId: 1 })} className="text-sm text-blue-600 hover:text-blue-800 font-bold hover:underline">
                                        Pagar Agora
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => navigateTo('ad-detail', ad.id)} className="p-2 text-gray-400 hover:text-brand-600 transition">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
