const ProfilePage = ({ navigateTo }) => {
    const [user, setUser] = React.useState(null);
    const [nome, setNome] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigateTo('login');
            return;
        }

        // Fetch user clean data from an endpoint or just use stored? 
        // Better trigger a refresh or use what we have if we can't fetch 'me'.
        // For MVP, assuming we stored user in localStorage or can decode token (less secure for dynamic data)
        // Let's rely on a 'me' endpoint if it exists, or update auth to return it.
        // Wait, authController doesn't have a 'me' endpoint. Let's use the stored user if available or fetch just by updating.
        // Actually, let's create a quick way to get user info? 
        // Checking existing code: App.js usually holds user state. 
        // I will assume I can get current user props or I'll just fetch from localStorage for now to populate Name/Email.

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const u = JSON.parse(storedUser);
            setUser(u);
            setNome(u.nome);
            setEmail(u.email);
        }
    }, [navigateTo]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await api.put('/auth/profile', {
                nome,
                password: password || undefined, // send undefined if empty to ignore
                confirmPassword: password ? confirmPassword : undefined
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert('Perfil atualizado com sucesso!');
            // Update local storage
            localStorage.setItem('user', JSON.stringify(res.data.user));
            // Trigger app update if possible, or just reload
            window.location.reload();
        } catch (error) {
            alert(error.response?.data?.error || 'Erro ao atualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="p-8 text-center">Carregando...</div>;

    return (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-4 animate-fade-in-up">
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="uppercase tracking-wide text-sm text-brand-600 font-bold">Meu Perfil</h2>
                    <button onClick={() => navigateTo('home')} className="text-gray-400 hover:text-gray-600">Voltar</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email (Não editável)</label>
                        <input
                            type="email"
                            value={email}
                            disabled
                            className="bg-gray-100 border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Nome de Exibição</label>
                        <input
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block w-full p-2.5"
                        />
                    </div>

                    <div className="border-t pt-4 mt-4">
                        <h3 className="text-gray-600 font-bold mb-4 text-sm">Alterar Senha (Opcional)</h3>
                        <div className="space-y-4">
                            <div>
                                <input
                                    type="password"
                                    placeholder="Nova Senha"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block w-full p-2.5"
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    placeholder="Confirmar Nova Senha"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block w-full p-2.5"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full text-white bg-brand-600 hover:bg-brand-700 focus:ring-4 focus:ring-brand-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </form>
            </div>
        </div>
    );
};
