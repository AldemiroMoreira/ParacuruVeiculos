const RegisterPage = ({ navigateTo }) => {
    const [formData, setFormData] = React.useState({ nome: '', email: '', password: '' });
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || data.message || 'Erro ao registrar');
            }

            setSuccess(data.message);
            // Removed setTimeout to let user read the message
        } catch (err) {
            setError(err.message || 'Erro ao registrar');
        }
    };

    if (success) {
        return (
            <div className="max-w-xs mx-auto mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100 fade-in text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Quase lá!</h2>
                <p className="text-gray-600 text-sm mb-6">{success}</p>
                <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs mb-6 text-left">
                    <p className="font-bold mb-1">Próximos passos:</p>
                    <ol className="list-decimal list-inside space-y-1">
                        <li>Acesse seu email.</li>
                        <li>Clique no link de ativação.</li>
                        <li>Aceite os termos de uso.</li>
                    </ol>
                </div>
                <button
                    onClick={() => navigateTo('login')}
                    className="w-full bg-brand-600 text-white py-2 rounded-lg font-bold hover:bg-brand-700 transition-colors shadow-lg"
                >
                    Ir para Login
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-xs mx-auto mt-8 bg-white p-4 rounded-xl shadow-lg border border-gray-100 fade-in">
            <h2 className="text-lg font-bold text-center mb-3 text-gray-900">Crie sua conta</h2>
            {error && <div className="bg-red-50 text-red-500 p-2 rounded-lg mb-3 text-xs text-center">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Nome</label>
                    <input
                        type="text"
                        className="w-full p-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                        value={formData.nome}
                        onChange={e => setFormData({ ...formData, nome: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Email</label>
                    <input
                        type="email"
                        className="w-full p-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Senha</label>
                    <input
                        type="password"
                        className="w-full p-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                </div>
                <button type="submit" className="w-full bg-brand-600 text-white py-2 rounded-lg font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30 text-sm">
                    Registrar
                </button>
            </form>
        </div>
    );
};
