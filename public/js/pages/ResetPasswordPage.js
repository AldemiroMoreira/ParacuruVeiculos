const ResetPasswordPage = ({ navigateTo }) => {
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [token, setToken] = React.useState('');

    React.useEffect(() => {
        // Extract token from URL hash: #/reset-password/:token
        const hash = window.location.hash;
        const parts = hash.split('/');
        // parts should be ["#", "reset-password", "TOKEN_HERE"]
        if (parts.length >= 3) {
            setToken(parts[2]);
        } else {
            setError('Token inválido ou ausente.');
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);

        try {
            await axios.post('/api/auth/reset-password', {
                token,
                password
            });
            setSuccess('Senha alterada com sucesso! Redirecionando para o login...');
            setTimeout(() => {
                navigateTo('login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao redefinir senha.');
        } finally {
            setLoading(false);
        }
    };

    if (!token && !error) return <div className="text-center mt-10">Carregando...</div>;

    return (
        <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-brand-600">Redefinir Senha</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {success}
                </div>
            )}

            {!success && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-2">Nova Senha</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-brand-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Confirmar Nova Senha</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-brand-500"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repita a senha"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !token}
                        className={`w-full bg-brand-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-700 transition duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Processando...' : 'Alterar Senha'}
                    </button>
                </form>
            )}
        </div>
    );
};
