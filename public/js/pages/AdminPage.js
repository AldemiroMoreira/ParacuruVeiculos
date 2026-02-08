const AdminPage = ({ navigateTo, user }) => {
    const [stats, setStats] = React.useState(null);
    const [ads, setAds] = React.useState([]);
    const [users, setUsers] = React.useState([]);
    const [activeTab, setActiveTab] = React.useState('ads');
    const [authorized, setAuthorized] = React.useState(false);
    const [creds, setCreds] = React.useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = React.useState(false);
    const [editingAd, setEditingAd] = React.useState(null);
    const [importingLinks, setImportingLinks] = React.useState(false);
    const [botActive, setBotActive] = React.useState(false);

    const checkAuth = (token) => {
        const config = {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        };
        axios.get('/api/admin/stats', config)
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
            axios.get('/api/propagandas/all', config),
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

        // Fetch Bot Status
        axios.get('/api/propagandas/bot-status', config)
            .then(res => setBotActive(res.data.active))
            .catch(err => console.error('Erro bot status:', err));
    };
};

const handleLogin = (e) => {
    e.preventDefault();
    axios.post('/api/auth/admin/login', creds)
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



if (!authorized) {
    return (
        <div className="max-w-sm mx-auto mt-20 p-8 bg-white shadow-lg rounded-xl">
            <h2 className="text-xl font-bold mb-4">Login Administrativo</h2>
            <form onSubmit={handleLogin} className="space-y-4">
                <input className="w-full p-2 border rounded" placeholder="Usuário" onChange={e => setCreds({ ...creds, username: e.target.value })} />
                <div className="relative">
                    <input
                        className="w-full p-2 border rounded pr-10"
                        type={showPassword ? "text" : "password"}
                        placeholder="Senha"
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



const handleImportLinks = async (e) => {
    e.preventDefault();
    const links = e.target.links.value;
    if (!confirm('Isso atualizará os links dos anúncios sequencialmente (ID 1 = Linha 1, ID 2 = Linha 2...). Confirmar?')) return;

    try {
        const token = localStorage.getItem('admin_token');
        const res = await axios.post('/api/propagandas/import-links', { links }, { headers: { Authorization: 'Bearer ' + token } });
        alert(res.data.message);
        setImportingLinks(false);
        loadDashboard(token); // Refresh list
    } catch (err) {
        alert('Erro ao importar: ' + (err.response?.data?.error || err.message));
    }
};

const handleToggleBot = async () => {
    try {
        const token = localStorage.getItem('admin_token');
        const newState = !botActive;
        await axios.post('/api/propagandas/bot-toggle', { active: newState }, { headers: { Authorization: 'Bearer ' + token } });
        setBotActive(newState);
        alert(`Robô ${newState ? 'ATIVADO' : 'DESATIVADO'} com sucesso!`);
    } catch (error) {
        alert('Erro ao alterar status do robô.');
    }
};

const handleVerify = async (id) => {
    try {
        const token = localStorage.getItem('admin_token');
        const res = await axios.put(`/api/admin/users/${id}/verify`, {}, { headers: { Authorization: 'Bearer ' + token } });
        setUsers(users.map(u => u.id === id ? { ...u, isVerified: true } : u));
        alert('Usuário ativado com sucesso!');
    } catch (e) { alert('Erro ao verificar usuário'); }
};

const handleSavePropaganda = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    const formData = new FormData(e.target);

    // Handle checkbox manual adjustment for FormData (optional, usually "on" acts as true-ish)
    // But backend expects boolean? JSON parsed it, multer might parse to string "on".
    // Let's ensure consistency:
    const isActive = formData.get('ativo') === 'on';
    formData.set('ativo', isActive ? 'true' : 'false');

    // If file input is empty, ensure we don't send an empty 'imagem' field that might confuse multer?
    // Multer handles empty file fine (req.file is undefined).

    try {
        const config = { headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'multipart/form-data' } };

        if (editingAd.id) {
            // Update
            const res = await axios.put(`/api/propagandas/${editingAd.id}`, formData, config);
            setAds(ads.map(a => a.id === editingAd.id ? res.data : a));
        } else {
            // Create
            const res = await axios.post('/api/propagandas', formData, config);
            setAds([res.data, ...ads]);
        }
        setEditingAd(null);
    } catch (error) {
        alert('Erro ao salvar propaganda: ' + (error.response?.data?.error || error.message));
    }
};

return (
    <div className="space-y-4 fade-in">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>

            {/* Tabs */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                <button onClick={() => setActiveTab('ads')} className={`px-3 py-1.5 rounded-md text-sm font-bold transition ${activeTab === 'ads' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Anúncios</button>
                <button onClick={() => setActiveTab('db')} className={`px-3 py-1.5 rounded-md text-sm font-bold transition ${activeTab === 'db' || activeTab === 'users' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Banco de Dados</button>
            </div>

            <div className="flex gap-4">
                <button onClick={() => { localStorage.removeItem('admin_token'); setAuthorized(false); navigateTo('home'); }} className="text-gray-600 hover:text-red-600 font-medium">Sair</button>
            </div>
        </div>

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
                        <h3 className="font-bold text-gray-900 text-sm">Gerenciar Propagandas (Afiliados/ML)</h3>
                        <div className="flex gap-2">
                            <button onClick={() => {
                                window.open('https://www.mercadolivre.com.br/afiliados/linkbuilder#hub', '_blank');
                                window.location.href = '/api/propagandas/export-links';
                            }} className="bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded hover:bg-gray-300 font-medium">⬇ Exportar Links</button>

                            <button onClick={() => setImportingLinks(true)} className="bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded hover:bg-gray-300 font-medium">⬆ Importar Links</button>
                            <button onClick={handleToggleBot} className={`text-xs px-3 py-1.5 rounded font-bold text-white transition ${botActive ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'}`}>
                                {botActive ? '🤖 Robô ON' : '🤖 Robô OFF'}
                            </button>
                            <button onClick={() => setEditingAd({})} className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-700 font-medium">+ Novo Anúncio</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-gray-600">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-2">ID</th>
                                    <th className="p-2">Imagem</th>
                                    <th className="p-2">Título/Link</th>
                                    <th className="p-2">Preço</th>
                                    <th className="p-2">Local</th>
                                    <th className="p-2">Views/Clicks</th>
                                    <th className="p-2">Status</th>
                                    <th className="p-2">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {Array.isArray(ads) && ads.map(ad => (
                                    <tr key={ad.id} className="hover:bg-gray-50">
                                        <td className="p-2">#{ad.id}</td>
                                        <td className="p-2">
                                            <img src={ad.imagem_url || '/favicon.svg'} alt="" className="w-10 h-10 object-contain rounded border bg-white" />
                                        </td>
                                        <td className="p-2 max-w-xs truncate">
                                            <div className="font-bold text-gray-800 truncate" title={ad.titulo}>{ad.titulo || 'Sem título'}</div>
                                            <a href={ad.link_destino || '#'} target="_blank" className="text-blue-500 hover:underline truncate block" title={ad.link_destino}>{ad.link_destino || 'Sem Link'}</a>
                                        </td>
                                        <td className="p-2 font-bold text-green-700">R$ {ad.preco || '0.00'}</td>
                                        <td className="p-2">{ad.localizacao || '-'}</td>
                                        <td className="p-2 text-xs">
                                            <div title="Visualizações">👁 {ad.views || 0}</div>
                                            <div title="Cliques" className="text-blue-600">🖱 {ad.clicks || 0}</div>
                                        </td>
                                        <td className="p-2">
                                            {ad.ativo ? <span className="text-green-600 font-bold">Ativo</span> : <span className="text-red-400">Inativo</span>}
                                        </td>
                                        <td className="p-2 flex gap-1">
                                            <button onClick={() => setEditingAd(ad)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Editar">✏️</button>
                                            <button onClick={() => handleDeletePropaganda(ad.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Excluir">🗑</button>
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
                    <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 text-sm">Gerenciar Usuários ({users.length})</h3>
                        <button onClick={() => setActiveTab('db')} className="text-xs text-blue-600 hover:underline">Voltar para Banco de Dados</button>
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
                                            {!u.isVerified && (
                                                <button
                                                    onClick={() => handleVerify(u.id)}
                                                    className="ml-1 px-2 py-1 rounded text-[10px] font-bold text-white bg-green-500 hover:bg-green-600"
                                                >
                                                    Ativar
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
                        <button onClick={() => navigateTo('db_crud_users')} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Gerenciar Usuários</button>
                        <button onClick={() => navigateTo('db_crud_anuncios')} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Gerenciar Anúncios</button>
                        <button onClick={() => navigateTo('db_crud_planos')} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Editar Planos</button>
                        <button onClick={() => navigateTo('db_crud_categorias')} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Editar Categorias</button>
                        <button onClick={() => navigateTo('db_crud_fabricantes')} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Editar Fabricantes</button>
                        <button onClick={() => navigateTo('db_crud_modelos')} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Editar Modelos</button>
                        <button onClick={() => navigateTo('ml-auth')} className="bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded shadow hover:bg-yellow-500">Conectar Mercado Livre</button>
                        <button onClick={() => {
                            if (confirm('Isso vai popular estados e cidades (pode demorar). Continuar?')) {
                                const token = localStorage.getItem('admin_token');
                                alert('Iniciando... aguarde o alerta de sucesso.');
                                axios.post('/api/admin/populate-locations', {}, { headers: { Authorization: 'Bearer ' + token } })
                                    .then(res => alert(res.data.message))
                                    .catch(err => alert('Erro: ' + (err.response?.data?.error || err.message)));
                            }
                        }} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">Popular Cidades</button>
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
        {/* EDIT MODAL */}
        {
            editingAd && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg overflow-y-auto max-h-[90vh]">
                        <h3 className="font-bold text-xl mb-4">{editingAd.id ? 'Editar Propaganda' : 'Nova Propaganda'}</h3>
                        <form onSubmit={handleSavePropaganda} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Título</label>
                                <input name="titulo" defaultValue={editingAd.titulo} className="w-full border p-2 rounded" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Preço (R$)</label>
                                    <input name="preco" type="number" step="0.01" defaultValue={editingAd.preco} className="w-full border p-2 rounded" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase">Localização</label>
                                    <select name="localizacao" defaultValue={editingAd.localizacao || 'sidebar'} className="w-full border p-2 rounded">
                                        <option value="sidebar">Sidebar/Lateral</option>
                                        <option value="home_middle">Home (Meio)</option>
                                        <option value="home_top">Home (Topo)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Link de Destino</label>
                                <input name="link_destino" defaultValue={editingAd.link_destino} className="w-full border p-2 rounded" required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase">Imagem</label>
                                {editingAd.imagem_url && (
                                    <div className="mb-2">
                                        <img src={editingAd.imagem_url} alt="Atual" className="h-20 object-contain border rounded" />
                                    </div>
                                )}
                                <input type="file" name="imagem" className="w-full border p-2 rounded text-sm" accept="image/*" required={!editingAd.id} />
                                <input type="hidden" name="imagem_url" defaultValue={editingAd.imagem_url} />
                                <div className="text-[10px] text-gray-400 mt-1">
                                    Selecione um arquivo para substituir a imagem atual.
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" name="ativo" defaultChecked={editingAd.ativo !== false} id="activeCheck" />
                                <label htmlFor="activeCheck" className="text-sm font-medium">Anúncio Ativo</label>
                            </div>
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <button type="button" onClick={() => setEditingAd(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700">
                                    {editingAd.id ? 'Salvar Alterações' : 'Criar Propaganda'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )
        }

        {
            importingLinks && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
                        <h3 className="font-bold text-xl mb-4">Importar Links (Bulk)</h3>
                        <p className="text-xs text-gray-500 mb-4">
                            Cole a lista de links gerados pelo Mercado Livre. <br />
                            <strong>Importante:</strong> A atualização é sequencial pelo ID. O primeiro link irá para o primeiro anúncio cadastrado (ID menor), e assim por diante.
                        </p>
                        <form onSubmit={handleImportLinks} className="space-y-4">
                            <textarea name="links" rows="10" className="w-full border p-2 rounded text-xs font-mono" placeholder="https://mercadolivre.com/..." required></textarea>
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <button type="button" onClick={() => setImportingLinks(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700">Importar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )
        }
    </div >
);
};
