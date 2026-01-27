const AdminPage = () => {
    const [stats, setStats] = React.useState(null);
    const [ads, setAds] = React.useState([]);
    const [authorized, setAuthorized] = React.useState(false);
    const [creds, setCreds] = React.useState({ username: '', password: '' });
    const [loading, setLoading] = React.useState(false);

    const checkAuth = async (token) => {
        try {
            await axios.get('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
            setAuthorized(true);
            loadDashboard(token);
        } catch (e) {
            setAuthorized(false);
        }
    };

    const loadDashboard = async (token) => {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const s = await axios.get('/api/admin/stats', config);
        const a = await axios.get('/api/admin/ads', config);
        setStats(s.data);
        setAds(a.data);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/admin/login', creds);
            localStorage.setItem('adminToken', res.data.token);
            setAuthorized(true);
            loadDashboard(res.data.token);
        } catch (e) {
            alert('Falha login admin');
        }
    };

    React.useEffect(() => {
        const t = localStorage.getItem('adminToken');
        if (t) checkAuth(t);
    }, []);

    if (!authorized) {
        return (
            <div className="max-w-sm mx-auto mt-20 p-8 bg-white shadow-lg rounded-xl">
                <h2 className="text-xl font-bold mb-4">Admin Login</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input className="w-full p-2 border rounded" placeholder="User" onChange={e => setCreds({ ...creds, username: e.target.value })} />
                    <input className="w-full p-2 border rounded" type="password" placeholder="Pass" onChange={e => setCreds({ ...creds, password: e.target.value })} />
                    <button className="w-full bg-gray-900 text-white py-2 rounded">Entrar</button>
                </form>
            </div>
        );
    }

    if (!stats) return <div>Carregando...</div>;

    return (
        <div className="space-y-8 fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
                <div className="flex gap-4">
                    <button
                        onClick={async () => {
                            if (confirm('ATENÇÃO: ISSO APAGARÁ TODO O BANCO DE DADOS DA PRODUÇÃO (ANÚNCIOS, USUÁRIOS) E RESTAURARÁ O PADRÃO. TEM CERTEZA??')) {
                                try {
                                    alert('Iniciando reset... isso pode levar alguns segundos.');
                                    const token = localStorage.getItem('adminToken');
                                    await axios.post('/api/db_crud/reset_full', {}, { headers: { Authorization: `Bearer ${token}` } });
                                    alert('Sucesso! O banco foi resetado.');
                                    window.location.reload();
                                } catch (e) {
                                    alert('Erro ao resetar: ' + (e.response?.data?.message || e.message));
                                }
                            }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold"
                    >
                        RESETAR SISTEMA (PERIGO)
                    </button>
                    <button onClick={() => { localStorage.removeItem('adminToken'); setAuthorized(false); }} className="text-gray-600 hover:text-red-600 font-medium">Sair</button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-sm mb-1">Total Anúncios</div>
                    <div className="text-3xl font-bold">{stats.totalAnuncios}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-sm mb-1">Anúncios Ativos</div>
                    <div className="text-3xl font-bold text-green-600">{stats.totalPagos}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-sm mb-1">Pendentes</div>
                    <div className="text-3xl font-bold text-yellow-600">{stats.totalPendentes}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-sm mb-1">Faturamento</div>
                    <div className="text-3xl font-bold text-blue-600">R$ {parseFloat(stats.totalFaturado).toFixed(2)}</div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Últimos Anúncios</h3>
                </div>
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Veículo</th>
                            <th className="p-4">Valor</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Usuário</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {ads.map(ad => (
                            <tr key={ad.id}>
                                <td className="p-4">#{ad.id}</td>
                                <td className="p-4 font-medium text-gray-900">{ad.titulo}</td>
                                <td className="p-4">R$ {ad.preco}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${ad.status === 'active' ? 'bg-green-100 text-green-700' :
                                        ad.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'
                                        }`}>
                                        {ad.status === 'pending_payment' ? 'Pendente' : ad.status}
                                    </span>
                                </td>
                                <td className="p-4">{ad.Usuario?.nome || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
