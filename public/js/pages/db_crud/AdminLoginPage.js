const AdminLoginPage = ({ navigateTo }) => {
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/db_crud/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('admin_token', data.token);
                // Redirect to the Dashboard
                navigateTo('admin');
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Erro ao conectar com servidor');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', background: 'white' }}>
            <h2 className="text-xl font-bold mb-4">Login Administrativo</h2>
            {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '15px' }}>
                    <label className="block text-sm font-medium text-gray-700">Senha Admin:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                </div>
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Entrar
                </button>
            </form>
        </div>
    );
};
