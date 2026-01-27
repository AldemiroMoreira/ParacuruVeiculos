const CategoriasCrudPage = ({ navigateTo }) => {
    // Access React globals
    const [categorias, setCategorias] = React.useState([]);
    const [newItem, setNewItem] = React.useState('');
    const [editId, setEditId] = React.useState(null);
    const [editValue, setEditValue] = React.useState('');

    React.useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            navigateTo('db_crud_login');
            return;
        }
        fetchCategorias();
    }, []);

    const fetchCategorias = async () => {
        try {
            const res = await fetch('/api/db_crud/categorias');
            const data = await res.json();
            setCategorias(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAdd = async () => {
        if (!newItem) return;
        await fetch('/api/db_crud/categorias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: newItem })
        });
        setNewItem('');
        fetchCategorias();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;
        await fetch(`/api/db_crud/categorias/${id}`, { method: 'DELETE' });
        fetchCategorias();
    };

    const startEdit = (cat) => {
        setEditId(cat.id);
        setEditValue(cat.nome);
    };

    const saveEdit = async () => {
        await fetch(`/api/db_crud/categorias/${editId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: editValue })
        });
        setEditId(null);
        fetchCategorias();
    };

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'Arial, sans-serif' }} className="p-4 bg-white shadow rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gerenciar Categorias</h1>
                <div className="space-x-4">
                    <button onClick={() => navigateTo('admin')} className="font-bold text-gray-800 hover:text-blue-600">
                        ← Painel Principal
                    </button>
                    <span className="text-gray-300">|</span>
                    <span className="font-bold text-blue-600">Categorias</span>
                    <span className="text-gray-300">|</span>
                    <button onClick={() => navigateTo('db_crud_planos')} className="text-gray-600 hover:text-blue-600">
                        Planos
                    </button>
                    <span className="text-gray-300">|</span>
                    <button onClick={() => navigateTo('db_crud_fabricantes')} className="text-gray-600 hover:text-blue-600">
                        Fabricantes
                    </button>
                    <span className="text-gray-300">|</span>
                    <button onClick={() => navigateTo('db_crud_modelos')} className="text-gray-600 hover:text-blue-600">
                        Modelos
                    </button>
                </div>
            </div>

            <div className="flex gap-2 mb-6">
                <input
                    type="text"
                    placeholder="Nova Categoria"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    className="flex-1 p-2 border rounded"
                />
                <button onClick={handleAdd} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    Adicionar
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {categorias.map(cat => (
                            <tr key={cat.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {editId === cat.id ? (
                                        <input
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="border p-1 rounded w-full"
                                        />
                                    ) : cat.nome}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    {editId === cat.id ? (
                                        <div className="flex justify-center gap-2">
                                            <button onClick={saveEdit} className="text-green-600 hover:text-green-900">Salvar</button>
                                            <button onClick={() => setEditId(null)} className="text-gray-600 hover:text-gray-900">Cancelar</button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-center gap-4">
                                            <button onClick={() => startEdit(cat)} className="text-blue-600 hover:text-blue-900">Editar</button>
                                            <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-900">Excluir</button>
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
