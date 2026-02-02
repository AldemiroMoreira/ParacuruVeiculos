const AdCard = ({ ad, onClick, isFavorite = false, onToggleFavorite = () => { } }) => {
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

    React.useEffect(() => {
        // Only cycle if there are multiple images
        if (!ad.images || ad.images.length <= 1) return;

        const intervalId = setInterval(() => {
            setCurrentImageIndex(prevIndex => (prevIndex + 1) % ad.images.length);
        }, 3000); // Changed to 3s for better UX (1s is too frantic), can be adjusted to 1000 if insisted.

        return () => clearInterval(intervalId);
    }, [ad.images]);

    const mainImage = ad.images && ad.images.length > 0
        ? ad.images[currentImageIndex].image_path
        : 'https://placehold.co/600x400';

    // Format price
    const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ad.preco);

    // Format KM
    const formattedKm = ad.km ? `${ad.km.toLocaleString('pt-BR')} km` : 'N/A';

    return (
        <div onClick={onClick} className="group block bg-green-50 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-green-100 cursor-pointer h-full flex flex-col relative">
            {/* Image Section */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={mainImage}
                    alt={ad.titulo}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />

                {/* Favorite Button (Internal) */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault(); // Extra safety
                        onToggleFavorite(e, ad.id);
                    }}
                    className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition z-50 ${isFavorite ? 'bg-white text-red-500' : 'bg-white/90 text-gray-400 hover:text-red-500'}`}
                    title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                >
                    <svg className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>

                <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/60 to-transparent opacity-60 pointer-events-none"></div>
                <div className="absolute bottom-3 left-3 text-white text-xs font-semibold flex items-center gap-1 pointer-events-none">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {ad.City?.name || 'Paracuru'} - {ad.State?.uf || 'CE'}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-grow relative bg-white">

                {/* Title */}
                <h3 className="text-gray-800 font-semibold text-sm mb-1 uppercase tracking-tight leading-tight line-clamp-1">
                    {ad.titulo}
                </h3>

                {/* Attributes Row (The Mobiauto Style) */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 font-medium">
                    <span className="bg-green-100 px-2 py-0.5 rounded text-green-700">{ad.ano_fabricacao}</span>
                    <span>•</span>
                    <span>{formattedKm}</span>
                    {/* Placeholder for Gearbox if we add it later */}
                    {/* <span>•</span> <span>Automático</span> */}
                </div>

                {/* Price */}
                <div className="mt-auto">
                    <span className="block text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                        {formattedPrice}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">Ver parcelas</span>
                </div>
            </div>
        </div>
    );
};
