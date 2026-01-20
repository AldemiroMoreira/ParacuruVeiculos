const AdBanner = ({ location, className = "" }) => {
    const [ads, setAds] = React.useState([]);

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

    const handleClick = async (ad) => {
        try {
            const res = await fetch(`/api/propagandas/${ad.id}/click`, { method: 'POST' });
            if (res.ok) {
                const data = await res.json();
                if (data.url) window.open(data.url, '_blank');
            }
        } catch (e) {
            // Fallback
            window.open(ad.link_destino, '_blank');
        }
    };

    if (ads.length === 0) return null;

    // Carousel or Stack? For now, just show first random ad or a simple grid effectively.
    // If 'home_top', let's show one big banner.
    // If 'sidebar', maybe vertical.

    // We get up to 5 random ads. Let's just pick the first one for the slot for simplicity, 
    // or map them if it's a grid area.

    const ad = ads[0];

    return (
        <div className={`w-full overflow-hidden rounded-lg shadow-sm border border-gray-100 cursor-pointer relative group ${className}`} onClick={() => handleClick(ad)}>
            <img src={ad.imagem_url} alt={ad.titulo} className="w-full h-full object-cover" />
            <div className="absolute top-0 right-0 bg-gray-900/50 text-white text-[10px] px-1">Patrocinado by Antigravity</div>
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white font-bold text-sm truncate">{ad.titulo}</p>
            </div>
        </div>
    );
};
