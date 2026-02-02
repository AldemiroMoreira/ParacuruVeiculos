const AdDetailPage = ({ adId, navigateTo, user }) => {
    const [ad, setAd] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

    React.useEffect(() => {
        const fetchAd = async () => {
            try {
                const response = await fetch(`/api/anuncios/${adId}`);
                if (response.ok) {
                    const data = await response.json();
                    setAd(data);
                    // Reset index when ad allows
                    setCurrentImageIndex(0);
                }
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchAd();
    }, [adId]);

    const handleContact = () => {
        if (!user) {
            alert('Você precisa estar logado para enviar uma mensagem.');
            navigateTo('login');
            return;
        }
        if (user.id === ad.usuario_id) {
            alert('Você não pode enviar mensagem para seu próprio anúncio.');
            return;
        }
        navigateTo('chat', { anuncioId: ad.id, otherUserId: ad.usuario_id });
    };

    const nextImage = (e) => {
        e.stopPropagation();
        if (ad && ad.images && ad.images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % ad.images.length);
        }
    };

    const prevImage = (e) => {
        e.stopPropagation();
        if (ad && ad.images && ad.images.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + ad.images.length) % ad.images.length);
        }
    };

    if (loading) return <div className="text-center py-20">Carregando...</div>;
    if (!ad) return <div className="text-center py-20">Anuncio não encontrado.</div>;

    const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ad.preco);

    // Safety check for images
    const hasImages = ad.images && ad.images.length > 0;
    const currentImageUrl = hasImages ? (ad.images[currentImageIndex]?.image_path || '') : '';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-in">
            {/* Gallery */}
            <div className="lg:col-span-2 space-y-4">
                <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 relative group">
                    {hasImages ? (
                        <>
                            <img src={currentImageUrl} className="w-full h-full object-cover" alt={ad.titulo} />

                            {/* Navigation Arrows */}
                            {ad.images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                        </svg>
                                    </button>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            Sem imagem
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-5 gap-2">
                    {ad.images && ad.images.map((img, idx) => (
                        <div key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 ${currentImageIndex === idx ? 'border-brand-500' : 'border-transparent'}`}>
                            <img src={img.image_path} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Info */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-fit">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{ad.titulo}</h1>
                <p className="text-4xl font-bold text-brand-600 mb-6">{formattedPrice}</p>

                <div className="space-y-4 text-sm text-gray-600 mb-8">
                    <div className="flex justify-between border-b py-2">
                        <span>Ano</span>
                        <span className="font-semibold text-gray-900">{ad.ano_fabricacao}</span>
                    </div>
                    <div className="flex justify-between border-b py-2">
                        <span>KM</span>
                        <span className="font-semibold text-gray-900">{ad.km}</span>
                    </div>
                    <div className="flex justify-between border-b py-2">
                        <span>Marca</span>
                        <div className="flex items-center gap-2">
                            {ad.Fabricante?.logo_url && <img src={ad.Fabricante?.logo_url} alt={ad.Fabricante?.nome} className="h-6 w-6 object-contain" />}
                            <span className="font-semibold text-gray-900">{ad.Fabricante?.nome}</span>
                        </div>
                    </div>
                    <div className="flex justify-between border-b py-2">
                        <span>Modelo</span>
                        <span className="font-semibold text-gray-900">{ad.Modelo?.nome}</span>
                    </div>
                    <div className="flex justify-between border-b py-2">
                        <span>Localização</span>
                        <span className="font-semibold text-gray-900">{ad.City?.nome}, {ad.State?.abbreviation}</span>
                    </div>
                </div>

                <div className="prose prose-sm text-gray-500 mb-8">
                    <h3 className="text-gray-900 font-semibold mb-2">Descrição</h3>
                    <p>{ad.descricao}</p>
                </div>

                <button onClick={handleContact} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-500/30">
                    Entrar em Contato
                </button>

                <div className="mt-8">
                    <AdBanner location="sidebar" className="h-64" />
                </div>
            </div>
        </div>
    );
};
