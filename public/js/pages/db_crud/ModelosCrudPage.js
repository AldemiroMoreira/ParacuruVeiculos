const ModelosCrudPage = ({ navigateTo }) => {
    const [modelos, setModelos] = React.useState([]);
    const [fabricantes, setFabricantes] = React.useState([]);
    const [categorias, setCategorias] = React.useState([]);

    // Form States
    const [newName, setNewName] = React.useState('');
    const [newFabId, setNewFabId] = React.useState('');
    const [newCatId, setNewCatId] = React.useState('');

    const [editId, setEditId] = React.useState(null);
    const [editName, setEditName] = React.useState('');
    const [editFabId, setEditFabId] = React.useState('');
    const [editCatId, setEditCatId] = React.useState('');

    React.useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            navigateTo('db_crud_login');
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [modRes, fabRes, catRes] = await Promise.all([
                fetch('/api/db_crud/modelos'),
                fetch('/api/db_crud/fabricantes'),
                fetch('/api/db_crud/categorias')
            ]);
            setModelos(await modRes.json());
            setFabricantes(await fabRes.json());
            setCategorias(await catRes.json());
        } catch (error) {
            console.error(error);
        }
    };

    const handleAdd = async () => {
        if (!newName || !newFabId || !newCatId) {
            alert('Preencha todos os campos');
            return;
        }
        await fetch('/api/db_crud/modelos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: newName,
                fabricante_id: newFabId,
                categoria_id: newCatId
            })
        });
        setNewName('');
        // Keep IDs for ease of entry? Or clear. Let's clear name only or all.
        // Clearing all for safety
        setNewFabId('');
        setNewCatId('');
        fetchData();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este modelo?')) return;
        await fetch(`/api/db_crud/modelos/${id}`, { method: 'DELETE' });
        fetchData();
    };

    const startEdit = (mod) => {
        setEditId(mod.id);
        setEditName(mod.nome);
        setEditFabId(mod.fabricante_id);
        setEditCatId(mod.categoria_id);
    };

    const saveEdit = async () => {
        await fetch(`/api/db_crud/modelos/${editId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: editName,
                fabricante_id: editFabId,
                categoria_id: editCatId
            })
        });
        setEditId(null);
        fetchData();
    };

    return (
        <div style={{ maxWidth: '900px', margin: '40px auto', fontFamily: 'Arial, sans-serif' }} className="p-4 bg-white shadow rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gerenciar Modelos</h1>
                <div className="space-x-4">
                    <button onClick={() => navigateTo('db_crud_categorias')} className="text-blue-600 hover:underline">
                        Categorias
                    </button>
                    <span className="text-gray-400">|</span>
                    <button onClick={() => navigateTo('db_crud_planos')} className="text-blue-600 hover:underline">
                        Planos
                    </button>
                    <span className="text-gray-400">|</span>
                    <button onClick={() => navigateTo('db_crud_fabricantes')} className="text-blue-600 hover:underline">
                        Fabricantes
                    </button>
                    <span className="text-gray-400">|</span>
                    <span className="font-bold text-gray-800">Modelos</span>
                </div>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap md:flex-nowrap">
                <input
                    type="text"
                    placeholder="Nome do Modelo"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="p-2 border rounded w-full md:w-1/3"
                />
                <select
                    value={newFabId}
                    onChange={(e) => setNewFabId(e.target.value)}
                    className="p-2 border rounded w-full md:w-1/3"
                >
                    <option value="">Selecione Fabricante...</option>
                    {fabricantes.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                </select>
                <select
                    value={newCatId}
                    onChange={(e) => setNewCatId(e.target.value)}
                    className="p-2 border rounded w-full md:w-1/3"
                >
                    <option value="">Selecione Categoria...</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full md:w-auto">
                    Adicionar
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fabricante</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {modelos.map(mod => (
                            <tr key={mod.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mod.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {editId === mod.id ? (
                                        <input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="border p-1 rounded w-full"
                                        />
                                    ) : mod.nome}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {editId === mod.id ? (
                                        <select
                                            value={editFabId}
                                            onChange={(e) => setEditFabId(e.target.value)}
                                            className="border p-1 rounded w-full"
                                        >
                                            {fabricantes.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                                        </select>
                                    ) : (mod.Fabricante?.nome || 'N/A')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {editId === mod.id ? (
                                        <select
                                            value={editCatId}
                                            onChange={(e) => setEditCatId(e.target.value)}
                                            className="border p-1 rounded w-full"
                                        >
                                            {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                        </select>
                                    ) : (mod.Categoria?.nome || 'N/A')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    {editId === mod.id ? (
                                        <div className="flex justify-center gap-2">
                                            <button onClick={saveEdit} className="text-green-600 hover:text-green-900">Salvar</button>
                                            <button onClick={() => setEditId(null)} className="text-gray-600 hover:text-gray-900">Cancelar</button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-center gap-4">
                                            <button onClick={() => startEdit(mod)} className="text-blue-600 hover:text-blue-900">Editar</button>
                                            <button onClick={() => handleDelete(mod.id)} className="text-red-600 hover:text-red-900">Excluir</button>
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
