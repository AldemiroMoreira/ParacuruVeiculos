const UsersCrudPage = ({ navigateTo }) => {
    const [users, setUsers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [editingId, setEditingId] = React.useState(null);
    const [formData, setFormData] = React.useState({ nome: '', email: '', password: '', isAdmin: false, isVerified: false, isBanned: false });

    React.useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            navigateTo('db_crud_login');
            return;
        }
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const res = await axios.get('/api/db_crud/users', {
                headers: { Authorization: 'Bearer ' + token }
            });
            setUsers(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            alert('Erro ao carregar usuários');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza absoluta que deseja excluir este usuário? Isso apagará também os anúncios dele.')) return;
        try {
            const token = localStorage.getItem('admin_token');
            await axios.delete(`/api/db_crud/users/${id}`, { headers: { Authorization: 'Bearer ' + token } });
            setUsers(users.filter(u => u.id !== id));
            // alert('Usuário excluído!');
        } catch (error) {
            alert('Erro ao excluir: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin_token');
            const config = { headers: { Authorization: 'Bearer ' + token } };

            if (editingId) {
                await axios.put(`/api/db_crud/users/${editingId}`, formData, config);
                // alert('Usuário atualizado!');
            } else {
                await axios.post('/api/db_crud/users', formData, config);
                // alert('Usuário criado!');
            }
            setEditingId(null);
            setFormData({ nome: '', email: '', password: '', isAdmin: false, isVerified: false, isBanned: false });
            fetchUsers();
        } catch (error) {
            alert('Erro ao salvar: ' + (error.response?.data?.error || error.message));
        }
    };

    const startEdit = (user) => {
        setEditingId(user.id);
        setFormData({
            nome: user.nome,
            email: user.email,
            password: '', // Password empty on edit unless changing
            isAdmin: user.isAdmin,
            isVerified: user.isVerified,
            isBanned: user.isBanned
        });
    };

    if (loading) return <div className="p-10 text-center">Carregando...</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '40px auto', fontFamily: 'Arial, sans-serif' }} className="p-4 bg-white shadow rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gerenciar Usuários (CRUD Completo)</h1>
                <button onClick={() => navigateTo('admin')} className="font-bold text-gray-800 hover:text-blue-600">
                    ← Painel Admin
                </button>
            </div>

            {/* Form */}
            <div className="mb-8 p-4 bg-gray-50 rounded border">
                <h3 className="font-bold mb-2">{editingId ? 'Editar Usuário' : 'Novo Usuário'}</h3>
                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input className="p-2 border rounded" placeholder="Nome" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} required />
                    <input className="p-2 border rounded" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                    <input className="p-2 border rounded" type="password" placeholder={editingId ? "Nova Senha (deixe vazio para manter)" : "Senha"} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />

                    <div className="flex gap-4 items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.isAdmin} onChange={e => setFormData({ ...formData, isAdmin: e.target.checked })} /> Admin
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.isVerified} onChange={e => setFormData({ ...formData, isVerified: e.target.checked })} /> Verificado
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.isBanned} onChange={e => setFormData({ ...formData, isBanned: e.target.checked })} /> Banido
                        </label>
                    </div>

                    <div className="md:col-span-2 flex gap-2">
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 w-full">
                            {editingId ? 'Salvar Alterações' : 'Criar Usuário'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={() => { setEditingId(null); setFormData({ nome: '', email: '', password: '', isAdmin: false, isVerified: false, isBanned: false }); }} className="bg-gray-400 text-white px-4 py-2 rounded font-bold hover:bg-gray-500">
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 text-left">ID</th>
                            <th className="p-2 text-left">Nome / Email</th>
                            <th className="p-2 text-left">Tags</th>
                            <th className="p-2 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(u => (
                            <tr key={u.id}>
                                <td className="p-2">{u.id}</td>
                                <td className="p-2">
                                    <div className="font-bold">{u.nome}</div>
                                    <div className="text-gray-500 text-xs">{u.email}</div>
                                </td>
                                <td className="p-2 space-x-1">
                                    {u.isAdmin && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-bold">ADMIN</span>}
                                    {u.isVerified && <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded font-bold">VERIFICADO</span>}
                                    {u.isBanned && <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded font-bold">BANIDO</span>}
                                </td>
                                <td className="p-2 text-center space-x-2">
                                    <button onClick={() => startEdit(u)} className="text-blue-600 font-bold hover:underline">Editar</button>
                                    <button onClick={() => handleDelete(u.id)} className="text-red-600 font-bold hover:underline">Excluir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
