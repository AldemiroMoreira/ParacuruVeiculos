const FabricantesCrudPage = ({ navigateTo }) => {
    const [fabricantes, setFabricantes] = React.useState([]);
    const [newItem, setNewItem] = React.useState('');
    const [newLogo, setNewLogo] = React.useState('');
    const [editId, setEditId] = React.useState(null);
    const [editValue, setEditValue] = React.useState('');
    const [editLogo, setEditLogo] = React.useState('');

    React.useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            navigateTo('db_crud_login');
            return;
        }
        fetchFabricantes();
    }, []);

    const fetchFabricantes = async () => {
        try {
            const res = await fetch('/api/db_crud/fabricantes');
            const data = await res.json();
            setFabricantes(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAdd = async () => {
        if (!newItem) return;
        await fetch('/api/db_crud/fabricantes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: newItem, logo_url: newLogo })
        });
        setNewItem('');
        setNewLogo('');
        fetchFabricantes();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este fabricante?')) return;
        await fetch(`/api/db_crud/fabricantes/${id}`, { method: 'DELETE' });
        fetchFabricantes();
    };

    const startEdit = (fab) => {
        setEditId(fab.id);
        setEditValue(fab.nome);
    };

    const saveEdit = async () => {
        await fetch(`/api/db_crud/fabricantes/${editId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: editValue })
        });
        setEditId(null);
        fetchFabricantes();
    };

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'Arial, sans-serif' }} className="p-4 bg-white shadow rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gerenciar Fabricantes</h1>
                <div className="space-x-4">
                    <button onClick={() => navigateTo('db_crud_categorias')} className="text-blue-600 hover:underline">
                        Categorias
                    </button>
                    <span className="text-gray-400">|</span>
                    <button onClick={() => navigateTo('db_crud_planos')} className="text-blue-600 hover:underline">
                        Planos
                    </button>
                    <span className="text-gray-400">|</span>
                    <span className="font-bold text-gray-800">Fabricantes</span>
                    <span className="text-gray-400">|</span>
                    <button onClick={() => navigateTo('db_crud_modelos')} className="text-blue-600 hover:underline">
                        Modelos
                    </button>
                </div>
            </div>

            <div className="flex gap-2 mb-6 flex-col md:flex-row">
                <input
                    type="text"
                    placeholder="Nome do Fabricante"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    className="flex-1 p-2 border rounded"
                />
                <input
                    type="text"
                    placeholder="URL do Logo"
                    value={newLogo}
                    onChange={(e) => setNewLogo(e.target.value)}
                    className="flex-1 p-2 border rounded"
                />
                <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Adicionar
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {fabricantes.map(fab => (
                            <tr key={fab.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fab.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {editId === fab.id ? (
                                        <input
                                            value={editLogo}
                                            onChange={(e) => setEditLogo(e.target.value)}
                                            className="border p-1 rounded w-full"
                                            placeholder="URL Logo"
                                        />
                                    ) : (
                                        fab.logo_url && <img src={fab.logo_url} alt={fab.nome} className="h-8 w-8 object-contain" />
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {editId === fab.id ? (
                                        <input
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="border p-1 rounded w-full"
                                        />
                                    ) : fab.nome}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    {editId === fab.id ? (
                                        <div className="flex justify-center gap-2">
                                            <button onClick={saveEdit} className="text-green-600 hover:text-green-900">Salvar</button>
                                            <button onClick={() => setEditId(null)} className="text-gray-600 hover:text-gray-900">Cancelar</button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-center gap-4">
                                            <button onClick={() => startEdit(fab)} className="text-blue-600 hover:text-blue-900">Editar</button>
                                            <button onClick={() => handleDelete(fab.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button onClick={() => navigateTo('home')} className="mt-8 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900">
                Voltar ao Site
            </button>
        </div>
    );
};
