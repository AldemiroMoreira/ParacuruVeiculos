const RegisterPage = ({ navigateTo }) => {
    const [formData, setFormData] = React.useState({ nome: '', email: '', password: '' });
    const [error, setError] = React.useState('');

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

            navigateTo('login');
        } catch (err) {
            setError(err.message || 'Erro ao registrar');
        }
    };

    return (
        <div className="max-w-xs mx-auto mt-8 bg-white p-4 rounded-xl shadow-lg border border-gray-100 fade-in">
            <h2 className="text-lg font-bold text-center mb-3 text-gray-900">Crie sua conta</h2>
            {error && <div className="bg-red-50 text-red-500 p-2 rounded-lg mb-3 text-xs text-center">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Nome Completo</label>
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
