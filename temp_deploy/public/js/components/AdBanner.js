const AdBanner = ({ location, className = "" }) => {
    const [ads, setAds] = React.useState([]);

    const [currentIndex, setCurrentIndex] = React.useState(0);

    // Fetch ads
    React.useEffect(() => {
        const fetchAds = async () => {
            try {
                const res = await fetch(`/api/propagandas?location=${location}`);
                if (res.ok) {
                    const data = await res.json();
                    setAds(data);
                }
            } catch (error) {
                console.error("Error fetching ads:", error);
            }
        };
        fetchAds();
    }, [location]);

    // Rotation Logic (15 seconds)
    React.useEffect(() => {
        if (ads.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
        }, 15000); // 15 seconds

        return () => clearInterval(interval);
    }, [ads]);

    const handleClick = async (ad) => {
        try {
            await fetch(`/api/propagandas/${ad.id}/click`, { method: 'POST' });
            if (ad.link_destino) window.open(ad.link_destino, '_blank');
        } catch (e) {
            if (ad.link_destino) window.open(ad.link_destino, '_blank');
        }
    };

    if (ads.length === 0) return null;

    const ad = ads[currentIndex] || ads[0];

    return (
        <div
            className={`flex flex-col w-full overflow-hidden rounded-xl shadow-sm border border-gray-100 cursor-pointer relative group bg-white hover:shadow-xl transition-all duration-300 ${className}`}
            onClick={() => handleClick(ad)}
        >
            {/* Image Container - Fixed height relative to card or flexible */}
            <div className="relative h-48 w-full bg-white flex items-center justify-center p-2 overflow-hidden">
                <img
                    src={ad.imagem_url}
                    alt={ad.titulo}
                    className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                />

                {/* Price Badge */}
                {ad.preco && (
                    <div className="absolute top-2 right-2 bg-green-600/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm z-10 border border-green-500">
                        R$ {Number(ad.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                )}
            </div>

            {/* Content Container */}
            <div className="p-3 bg-gray-50/50 flex flex-col flex-1 border-t border-gray-100">
                <h3 className="text-gray-900 font-bold text-sm leading-tight line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                    {ad.titulo}
                </h3>

                {/* Optional: Add location/brand if available, or just keeping it simple */}

                {ad.descricao && (
                    <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-2">
                        {ad.descricao}
                    </p>
                )}

                {/* Call to Action */}
                <div className="mt-auto pt-2 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">Patrocinado</span>
                    <div className="text-blue-600 text-xs font-bold flex items-center gap-1 group-hover:underline">
                        Ver oferta <span className="text-[10px]">↗</span>
                    </div>
                </div>
            </div>

            {/* Progress Bar for rotation */}
            {ads.length > 1 && (
                <div className="absolute bottom-0 left-0 h-0.5 bg-gray-200 w-full">
                    <div
                        key={currentIndex}
                        className="h-full bg-blue-600 animate-progress origin-left"
                        style={{ animationDuration: '15s' }}
                    ></div>
                </div>
            )}
        </div>
    );
};
