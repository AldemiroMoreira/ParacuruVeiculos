const MLAuthPage = () => {
    const [authUrl, setAuthUrl] = React.useState('');

    React.useEffect(() => {
        fetch('/api/ml/auth-url')
            .then(res => res.json())
            .then(data => setAuthUrl(data.url))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full border border-gray-100">
                <div className="mb-6">
                    <span className="text-4xl">🤝</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Conectar Mercado Livre</h1>
                <p className="text-gray-500 mb-8 text-sm">
                    Para habilitar o robô de afiliados, precisamos que você autorize o acesso à API do Mercado Livre.
                </p>

                {authUrl ? (
                    <a
                        href={authUrl}
                        className="block w-full bg-[#FFE600] text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-colors shadow-sm"
                    >
                        Conectar Agora
                    </a>
                ) : (
                    <div className="animate-pulse h-12 bg-gray-200 rounded-lg"></div>
                )}

                <p className="mt-4 text-xs text-gray-400">
                    Você será redirecionado para o site do Mercado Livre.
                </p>
            </div>
        </div>
    );
};

window.MLAuthPage = MLAuthPage;
