const Footer = () => {
    return (
        <footer className="bg-slate-900 text-white border-t border-slate-800">
            <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
                <div>
                    <h3 className="font-bold text-lg mb-4 text-brand-400">Sobre Nós</h3>
                    <p className="text-gray-400 leading-relaxed">
                        Somos uma empresa de Tecnologia da Informação focada em conectar compradores e vendedores de veículos em todo o Brasil.
                        Nossa missão é oferecer uma plataforma segura, rápida e eficiente.
                    </p>
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-4 text-brand-400">Contato</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li className="flex items-center gap-2">
                            <span className="text-green-500 text-lg">📱</span>
                            <span>WhatsApp: +55 (85) 99109-7847</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-blue-500 text-lg">📧</span>
                            <span>suporte@paracuruveiculos.com.br</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-yellow-500 text-lg">🌍</span>
                            <span>Atendemos todo o Brasil</span>
                        </li>
                    </ul>
                </div>
                <div className="text-gray-400">
                    <h3 className="font-bold text-lg mb-4 text-brand-400">Legal</h3>
                    <p>© 2026 ParacuruVeículos. Todos os direitos reservados.</p>
                    <p className="mt-2 text-xs">Desenvolvido com tecnologia de ponta para máxima performance.</p>
                </div>
            </div>
        </footer>
    );
};
