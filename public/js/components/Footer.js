const Footer = ({ navigateTo }) => {
    return (
        <footer className="bg-sky-500 text-white mt-12">
            <div className="container mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                    <div className="flex flex-col -space-y-1 mb-4">
                        <span className="text-[10px] font-semibold tracking-[0.2em] text-blue-100 uppercase leading-none ml-0.5 opacity-90">Paracuru</span>
                        <h3 className="text-xl font-black text-white tracking-tighter leading-none italic drop-shadow-sm">
                            VEÍCULOS<span className="text-amber-400">.</span>
                        </h3>
                    </div>
                    <p className="text-blue-50 leading-relaxed font-medium">
                        Somos uma empresa de Tecnologia da Informação focada em conectar compradores e vendedores de veículos em todo o Brasil.
                        Nossa missão é oferecer uma plataforma segura, rápida e eficiente.
                    </p>
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-4 text-white">Contato</h3>
                    <div className="flex flex-col gap-3">
                        <p className="text-blue-50 text-sm mb-2">Precisa de ajuda? Fale direto com a gente.</p>
                        <button
                            onClick={() => {
                                // Admin ID: 1, Support Ad ID: 24 (Created by check_admin_ads.js)
                                if (navigateTo) {
                                    navigateTo('chat', { anuncioId: 24, otherUserId: 1 });
                                } else {
                                    console.error("navigateTo prop missing in Footer");
                                }
                            }}
                            className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2 w-fit"
                        >
                            <span className="text-lg">💬</span>
                            Administrador / Suporte
                        </button>
                    </div>
                </div>
                <div className="text-blue-100">
                    <h3 className="font-bold text-lg mb-4 text-white">Legal</h3>
                    <p>© 2026 ParacuruVeículos. Todos os direitos reservados.</p>
                    <p className="mt-2 text-xs opacity-80">Desenvolvido com tecnologia de ponta para máxima performance.</p>
                </div>
            </div>
        </footer>
    );
};
