const AdCard = ({ ad, onClick }) => {
    const mainImage = ad.images && ad.images.length > 0 ? ad.images[0].image_path : 'https://placehold.co/600x400';

    // Format price
    const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ad.preco);

    return (
        <div onClick={onClick} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 cursor-pointer">
            <div className="relative aspect-[3/2] overflow-hidden">
                <img
                    src={mainImage}
                    alt={ad.titulo}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-semibold text-gray-900 shadow-sm">
                    {ad.ano_fabricacao}
                </div>
            </div>
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-bold text-gray-900 line-clamp-1">{ad.titulo}</h3>
                </div>
                <p className="text-gray-500 text-xs mb-3 line-clamp-2">{ad.descricao}</p>

                <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                    <span className="text-lg font-bold text-brand-600">{formattedPrice}</span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                        {ad.City?.name || 'N/A'}/{ad.State?.uf || 'UF'}
                    </span>
                </div>
            </div>
        </div>
    );
};
