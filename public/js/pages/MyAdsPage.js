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

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.')) return;

        try {
            const token = localStorage.getItem('token');
            await api.delete(`/anuncios/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update list
            setAds(prev => prev.filter(ad => ad.id !== id));
            alert('Anúncio excluído com sucesso!');
        } catch (err) {
            console.error(err);
            alert('Erro ao excluir anúncio.');
        }
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
                                {ad.images && ad.images.length > 0 ? (
                                    <img src={ad.images[0].image_path || ad.images[0].url} alt={ad.titulo} className="w-full h-full object-cover" />
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
                                {ad.status === 'active' && ad.expires_at && (
                                    <div className="flex flex-col items-center">
                                        <button onClick={() => navigateTo('checkout', { adId: ad.id, planId: 1 })} className="mt-2 bg-brand-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-brand-700 w-full shadow-sm transition-all transform hover:scale-105 flex items-center justify-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                            </svg>
                                            Renovar
                                        </button>
                                        {new Date(ad.expires_at) > new Date() && (
                                            <span className="text-[10px] text-green-600 font-extrabold mt-1 animate-pulse bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                                                ★ 20% OFF
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleDelete(ad.id)} className="p-2 text-red-500 hover:text-red-700 transition" title="Excluir Anúncio">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                </button>
                                <button onClick={() => navigateTo('edit-ad', ad.id)} className="p-2 text-blue-500 hover:text-blue-700 transition" title="Editar Anúncio">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                    </svg>
                                </button>
                                <button onClick={() => navigateTo('ad-detail', ad.id)} className="p-2 text-gray-400 hover:text-brand-600 transition" title="Ver Detalhes">
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
