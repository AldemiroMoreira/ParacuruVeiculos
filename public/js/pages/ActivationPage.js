const ActivationPage = ({ navigateTo }) => {
    const [status, setStatus] = React.useState('initial'); // initial, loading, success, error
    const [message, setMessage] = React.useState('');
    const [token, setToken] = React.useState(null);

    React.useEffect(() => {
        const hash = window.location.hash;
        const parts = hash.split('/');
        // Expected format: #/activate/TOKEN
        if (parts.length >= 3) {
            setToken(parts[2]);
            setStatus('initial');
        } else {
            setStatus('error');
            setMessage('Link de ativação inválido.');
        }
    }, []);

    const handleAcceptAndActivate = async () => {
        if (!token) return;

        setStatus('loading');
        setMessage('Ativando sua conta...');

        try {
            const res = await fetch('/api/auth/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });
            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage(data.message);
            } else {
                setStatus('error');
                setMessage(data.message || 'Erro ao ativar conta.');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Erro de conexão ao ativar conta.');
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg fade-in">
            {status === 'initial' && (
                <div>
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Ativação de Conta</h2>
                        <p className="text-gray-600">Para concluir seu cadastro, leia e aceite os termos abaixo.</p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6 text-sm text-gray-700 h-64 overflow-y-auto">
                        <h3 className="font-bold text-gray-900 mb-2">Termos de Uso e Isenção de Responsabilidade</h3>
                        <p className="mb-3">
                            Bem-vindo ao <strong>ParacuruVeículos</strong>. Ao utilizar nossa plataforma, você concorda que:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 pl-2">
                            <li>
                                <strong>Somos apenas um Catálogo:</strong> O site funciona exclusivamente como uma plataforma de classificados online para conectar vendedores e compradores. Nós <strong>NÃO</strong> participamos das negociações, não intermediamos pagamentos e não possuímos a posse dos veículos anunciados.
                            </li>
                            <li>
                                <strong>Segurança de Dados (LGPD):</strong> Seus dados pessoais são armazenados de forma segura e criptografada (hash). Utilizamos tecnologias modernas para proteger suas informações contra acesso não autorizado, em conformidade com as leis de proteção de dados.
                            </li>
                            <li>
                                <strong>Pagamentos Seguros:</strong> Para destacar seus anúncios, utilizamos o <strong>Mercado Pago</strong>, uma das plataformas mais seguras do mundo. Seus dados financeiros NUNCA passam por nossos servidores; toda a transação ocorre no ambiente criptografado do Mercado Pago.
                            </li>
                            <li>
                                <strong>Isenção de Responsabilidade:</strong> O ParacuruVeículos não se responsabiliza pela veracidade das informações dos anúncios, pelo estado de conservação dos veículos, pela documentação ou pelo sucesso das transações. Toda a negociação é de responsabilidade exclusiva das partes envolvida.
                            </li>
                            <li>
                                <strong>Alerta de Segurança (Golpes):</strong>
                                <ul className="list-disc list-inside pl-4 mt-1 text-red-600 font-semibold">
                                    <li>NUNCA faça depósitos antecipados (sinal/reserva) sem ver o veículo.</li>
                                    <li>NUNCA envie códigos de confirmação recebidos por SMS/WhatsApp para estranhos.</li>
                                    <li>Desconfie de ofertas muito abaixo do valor de mercado.</li>
                                    <li>Verifique a documentação e o veículo pessoalmente em local público e seguro.</li>
                                </ul>
                            </li>
                            <li>
                                <strong>Dados do Usuário:</strong> Você garante que as informações fornecidas no cadastro são verdadeiras e assume total responsabilidade pelo uso de sua conta.
                            </li>
                        </ol>
                        <p className="mt-4 font-semibold">
                            Ao clicar em "Li, Aceito e Ativar", você declara estar ciente e de acordo com estes termos.
                        </p>
                    </div>

                    <button
                        onClick={handleAcceptAndActivate}
                        className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2"
                    >
                        <span>Li, Aceito e Quero Ativar Minha Conta</span>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </div>
            )}

            {status === 'loading' && (
                <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-4 mx-auto"></div>
                    <h2 className="text-xl font-bold text-gray-700">{message}</h2>
                </div>
            )}

            {status === 'success' && (
                <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-green-600 mb-2">Conta Ativada!</h2>
                    <p className="text-gray-600 mb-4">{message}</p>
                    <div className="bg-green-50 text-green-800 p-4 rounded-lg text-sm max-w-sm mx-auto mb-4">
                        <p>Sua conta está pronta para uso! Agora você pode criar anúncios e gerenciar suas vendas.</p>
                    </div>
                    <button onClick={() => navigateTo('login')} className="mt-4 bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-200">
                        Ir para Login agora
                    </button>
                </div>
            )}

            {status === 'error' && (
                <div className="text-center py-6">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Falha na Ativação</h2>
                    <p className="text-gray-600 mb-4">{message}</p>
                    <button onClick={() => navigateTo('home')} className="mt-4 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-300">
                        Voltar ao Início
                    </button>
                </div>
            )}
        </div>
    );
};
