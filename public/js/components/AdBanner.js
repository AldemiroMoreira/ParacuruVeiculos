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
            className={`w-full overflow-hidden rounded-xl shadow-md border border-gray-200 cursor-pointer relative group bg-white hover:shadow-lg transition-shadow duration-300 ${className}`}
            onClick={() => handleClick(ad)}
        >
            {/* Image Container */}
            <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                    src={ad.imagem_url}
                    alt={ad.titulo}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Price Badge */}
                {ad.preco && (
                    <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm z-10">
                        R$ {Number(ad.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                )}
            </div>

            {/* Content Container */}
            <div className="p-3 bg-white">
                <h3 className="text-gray-800 font-bold text-sm leading-tight line-clamp-2 mb-1 group-hover:text-brand-600 transition-colors">
                    {ad.titulo}
                </h3>

                {ad.descricao && (
                    <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                        {ad.descricao}
                    </p>
                )}

                {/* Call to Action */}
                <div className="mt-2 text-brand-600 text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver oferta <span className="text-[10px]">↗</span>
                </div>
            </div>

            {/* Progress Bar for rotation */}
            {ads.length > 1 && (
                <div className="absolute bottom-0 left-0 h-1 bg-brand-500/20 w-full">
                    <div
                        key={currentIndex}
                        className="h-full bg-brand-500 animate-progress origin-left"
                        style={{ animationDuration: '15s' }}
                    ></div>
                </div>
            )}
        </div>
    );
};
