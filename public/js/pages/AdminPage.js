const AdminPage = ({ navigateTo, user }) => {
    const [stats, setStats] = React.useState(null);
    const [ads, setAds] = React.useState([]);
    const [users, setUsers] = React.useState([]);
    const [activeTab, setActiveTab] = React.useState('ads');
    const [authorized, setAuthorized] = React.useState(false);
    const [creds, setCreds] = React.useState({ username: '', password: '' });

    const checkAuth = (token) => {
        axios.get('/api/admin/stats', { headers: { Authorization: 'Bearer ' + token } })
            .then(() => {
                setAuthorized(true);
                loadDashboard(token);
            })
            .catch(() => {
                setAuthorized(false);
            });
    };

    const loadDashboard = (token) => {
        const config = { headers: { Authorization: 'Bearer ' + token } };

        Promise.all([
            axios.get('/api/admin/stats', config),
            axios.get('/api/admin/ads', config),
            axios.get('/api/admin/users', config)
        ]).then(([s, a, u]) => {
            setStats(s.data);
            setAds(a.data);
            setUsers(u.data);
        }).catch(err => {
            console.error('Failed to load dashboard:', err);
            // Optionally alert user or just stop loading
            // For now, we set stats to empty object to remove loading state
            setStats({ totalAnuncios: 0, totalPagos: 0, totalPendentes: 0, totalFaturado: 0 });
            setAds([]);
        });
    };

    const handleLogin = (e) => {
        e.preventDefault();
        api.post('/auth/admin/login', creds)
            .then(res => {
                localStorage.setItem('admin_token', res.data.token);
                setAuthorized(true);
                loadDashboard(res.data.token);
            })
            .catch((err) => {
                alert('Falha login admin: ' + (err.response?.data?.error || 'Erro desconhecido'));
            });
    };

    React.useEffect(() => {
        const t = localStorage.getItem('admin_token');
        if (t) checkAuth(t);
    }, []);

    const [showPassword, setShowPassword] = React.useState(false);

    if (!authorized) {
        return (
            <div className="max-w-sm mx-auto mt-20 p-8 bg-white shadow-lg rounded-xl">
                <h2 className="text-xl font-bold mb-4">Admin Login</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input className="w-full p-2 border rounded" placeholder="User" onChange={e => setCreds({ ...creds, username: e.target.value })} />
                    <div className="relative">
                        <input
                            className="w-full p-2 border rounded pr-10"
                            type={showPassword ? "text" : "password"}
                            placeholder="Pass"
                            onChange={e => setCreds({ ...creds, password: e.target.value })}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <button className="w-full bg-gray-900 text-white py-2 rounded">Entrar</button>
                </form>
            </div>
        );
    }

    if (!stats) {
        return <div className="p-8 text-center text-gray-500">Carregando painel...</div>;
    }

    const handleReset = () => {
        if (confirm('ATENÇÃO: ISSO APAGARÁ TODO O BANCO DE DADOS DA PRODUÇÃO (ANÚNCIOS, USUÁRIOS) E RESTAURARÁ O PADRÃO. TEM CERTEZA??')) { // eslint-disable-line no-restricted-globals
            alert('Iniciando reset... isso pode levar alguns segundos.');
            const token = localStorage.getItem('admin_token');
            axios.post('/api/db_crud/reset_full', {}, { headers: { Authorization: 'Bearer ' + token } })
                .then(() => {
                    alert('Sucesso! O banco foi resetado.');
                    window.location.reload();
                })
                .catch((e) => {
                    const msg = (e.response && e.response.data && e.response.data.message) || e.message;
                    alert('Erro ao resetar: ' + msg);
                });
        }
    };

    const handleApprove = async (id) => {
        try {
            const token = localStorage.getItem('admin_token');
            await axios.put(`/api/admin/ads/${id}/approve`, {}, { headers: { Authorization: 'Bearer ' + token } });
            setAds(ads.map(ad => ad.id === id ? { ...ad, status: 'active' } : ad));
            alert('Anúncio aprovado!');
        } catch (e) { alert('Erro ao aprovar'); }
    };

    const handleReject = async (id) => {
        if (!confirm('Rejeitar e excluir este anúncio?')) return;
        try {
            const token = localStorage.getItem('admin_token');
            await axios.delete(`/api/admin/ads/${id}/reject`, { headers: { Authorization: 'Bearer ' + token } });
            setAds(ads.filter(ad => ad.id !== id));
            alert('Anúncio rejeitado!');
        } catch (e) { alert('Erro ao rejeitar'); }
    };

    const handleBan = async (id) => {
        try {
            const token = localStorage.getItem('admin_token');
            const res = await axios.put(`/api/admin/users/${id}/ban`, {}, { headers: { Authorization: 'Bearer ' + token } });
            setUsers(users.map(u => u.id === id ? { ...u, isBanned: res.data.isBanned } : u));
            // alert(res.data.message);
        } catch (e) { alert('Erro ao banir/desbanir'); }
    };

    return (
        <div className="space-y-4 fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>

                {/* Tabs */}
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setActiveTab('ads')} className={`px-3 py-1.5 rounded-md text-sm font-bold transition ${activeTab === 'ads' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Anúncios</button>
                    <button onClick={() => setActiveTab('users')} className={`px-3 py-1.5 rounded-md text-sm font-bold transition ${activeTab === 'users' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Usuários</button>
                    <button onClick={() => setActiveTab('db')} className={`px-3 py-1.5 rounded-md text-sm font-bold transition ${activeTab === 'db' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Banco de Dados</button>
                </div>

                <div className="flex gap-4">
                    <button onClick={() => { localStorage.removeItem('admin_token'); setAuthorized(false); navigateTo('home'); }} className="text-gray-600 hover:text-red-600 font-medium">Sair</button>
                </div>
            </div>

            {/* Stats Cards */}
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-xs mb-1">Total Anúncios</div>
                    <div className="text-2xl font-bold">{stats.totalAnuncios}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-xs mb-1">Anúncios Ativos</div>
                    <div className="text-2xl font-bold text-green-600">{stats.totalPagos}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-xs mb-1">Pendentes</div>
                    <div className="text-2xl font-bold text-yellow-600">{stats.totalPendentes}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-xs mb-1">Faturamento</div>
                    <div className="text-2xl font-bold text-blue-600">R$ {parseFloat(stats.totalFaturado).toFixed(2)}</div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                {activeTab === 'ads' && (
                    <>
                        <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 text-sm">Gerenciar Anúncios</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-gray-600">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-2">ID</th>
                                        <th className="p-2">Veículo</th>
                                        <th className="p-2">Valor</th>
                                        <th className="p-2">Status</th>
                                        <th className="p-2">Usuário</th>
                                        <th className="p-2">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {ads.map(ad => (
                                        <tr key={ad.id}>
                                            <td className="p-2">#{ad.id}</td>
                                            <td className="p-2 font-medium text-gray-900">{ad.titulo}</td>
                                            <td className="p-2">R$ {ad.preco}</td>
                                            <td className="p-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ad.status === 'active' ? 'bg-green-100 text-green-700' :
                                                    ad.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'
                                                    }`}>
                                                    {ad.status === 'pending_payment' ? 'Pendente' : ad.status}
                                                </span>
                                            </td>
                                            <td className="p-2">{ad.Usuario?.nome || 'N/A'}</td>
                                            <td className="p-2 flex gap-1">
                                                {ad.status !== 'active' && (
                                                    <button onClick={() => handleApprove(ad.id)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Aprovar">✔</button>
                                                )}
                                                <button onClick={() => handleReject(ad.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Rejeitar/Excluir">✖</button>
                                                <button onClick={() => navigateTo('ad-detail', ad.id)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Ver">👁</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {activeTab === 'users' && (
                    <>
                        <div className="p-3 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900 text-sm">Gerenciar Usuários ({users.length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-gray-600">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-2">ID</th>
                                        <th className="p-2">Nome</th>
                                        <th className="p-2">Email</th>
                                        <th className="p-2">Verificado</th>
                                        <th className="p-2">Admin</th>
                                        <th className="p-2">Status</th>
                                        <th className="p-2">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td className="p-2">#{u.id}</td>
                                            <td className="p-2 font-medium text-gray-900">{u.nome}</td>
                                            <td className="p-2">{u.email}</td>
                                            <td className="p-2">{u.isVerified ? 'Sim' : 'Não'}</td>
                                            <td className="p-2">{u.isAdmin ? 'SIM' : '-'}</td>
                                            <td className="p-2">
                                                {u.isBanned ? <span className="text-red-600 font-bold">BANIDO</span> : <span className="text-green-600">Ativo</span>}
                                            </td>
                                            <td className="p-2">
                                                {!u.isAdmin && (
                                                    <button
                                                        onClick={() => handleBan(u.id)}
                                                        className={`px-2 py-1 rounded text-[10px] font-bold text-white ${u.isBanned ? 'bg-gray-500 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}
                                                    >
                                                        {u.isBanned ? 'Desbanir' : 'Banir'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {activeTab === 'db' && (
                    <div className="p-8 text-center space-y-4">
                        <h3 className="font-bold text-xl">Ferramentas de Banco de Dados</h3>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <button onClick={() => navigateTo('db_crud_anuncios')} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Gerenciar Anúncios</button>
                            <button onClick={() => navigateTo('db_crud_planos')} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Editar Planos</button>
                            <button onClick={() => navigateTo('db_crud_categorias')} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Editar Categorias</button>
                            <button onClick={() => navigateTo('db_crud_fabricantes')} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Editar Fabricantes</button>
                            <button onClick={() => navigateTo('db_crud_modelos')} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Editar Modelos</button>
                        </div>
                        <div className="pt-8 border-t">
                            <button
                                onClick={handleReset}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg"
                            >
                                ⚠️ RESETAR SISTEMA COMPLETO ⚠️
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
