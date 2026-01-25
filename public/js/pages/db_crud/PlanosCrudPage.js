const PlanosCrudPage = ({ navigateTo }) => {
    const [planos, setPlanos] = React.useState([]);
    const [newItem, setNewItem] = React.useState({ nome: '', duracao_dias: '', preco: '' });
    const [editId, setEditId] = React.useState(null);
    const [editValue, setEditValue] = React.useState({ nome: '', duracao_dias: '', preco: '' });

    React.useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            navigateTo('db_crud_login');
            return;
        }
        fetchPlanos();
    }, []);

    const fetchPlanos = async () => {
        try {
            const res = await fetch('/api/db_crud/planos');
            const data = await res.json();
            setPlanos(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAdd = async () => {
        if (!newItem.nome || !newItem.duracao_dias || !newItem.preco) return;

        await fetch('/api/db_crud/planos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newItem)
        });
        setNewItem({ nome: '', duracao_dias: '', preco: '' });
        fetchPlanos();
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este plano?')) return;
        await fetch(`/api/db_crud/planos/${id}`, { method: 'DELETE' });
        fetchPlanos();
    };

    const startEdit = (plano) => {
        setEditId(plano.id);
        setEditValue({ nome: plano.nome, duracao_dias: plano.duracao_dias, preco: plano.preco });
    };

    const saveEdit = async () => {
        await fetch(`/api/db_crud/planos/${editId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editValue)
        });
        setEditId(null);
        fetchPlanos();
    };

    return (
        <div style={{ maxWidth: '900px', margin: '40px auto', fontFamily: 'Arial, sans-serif' }} className="p-4 bg-white shadow rounded-lg">

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gerenciar Planos</h1>
                <div className="space-x-4">
                    <button onClick={() => navigateTo('db_crud_categorias')} className="text-blue-600 hover:underline">
                        Gerenciar Categorias
                    </button>
                    <span className="text-gray-400">|</span>
                    <span className="font-bold text-gray-800">Gerenciar Planos</span>
                </div>
            </div>

            <div className="flex gap-2 mb-6 bg-gray-50 p-4 rounded">
                <input
                    type="text"
                    placeholder="Nome do Plano"
                    value={newItem.nome}
                    onChange={(e) => setNewItem({ ...newItem, nome: e.target.value })}
                    className="flex-1 p-2 border rounded"
                />
                <input
                    type="number"
                    placeholder="Duração (dias)"
                    value={newItem.duracao_dias}
                    onChange={(e) => setNewItem({ ...newItem, duracao_dias: e.target.value })}
                    className="w-32 p-2 border rounded"
                />
                <input
                    type="number"
                    step="0.01"
                    placeholder="Preço (R$)"
                    value={newItem.preco}
                    onChange={(e) => setNewItem({ ...newItem, preco: e.target.value })}
                    className="w-32 p-2 border rounded"
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duração</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {planos.map(plano => (
                            <tr key={plano.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plano.id}</td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {editId === plano.id ? (
                                        <input
                                            value={editValue.nome}
                                            onChange={(e) => setEditValue({ ...editValue, nome: e.target.value })}
                                            className="border p-1 rounded w-full"
                                        />
                                    ) : plano.nome}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {editId === plano.id ? (
                                        <input
                                            type="number"
                                            value={editValue.duracao_dias}
                                            onChange={(e) => setEditValue({ ...editValue, duracao_dias: e.target.value })}
                                            className="border p-1 rounded w-24"
                                        />
                                    ) : `${plano.duracao_dias} dias`}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {editId === plano.id ? (
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editValue.preco}
                                            onChange={(e) => setEditValue({ ...editValue, preco: e.target.value })}
                                            className="border p-1 rounded w-24"
                                        />
                                    ) : `R$ ${parseFloat(plano.preco).toFixed(2)}`}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    {editId === plano.id ? (
                                        <div className="flex justify-center gap-2">
                                            <button onClick={saveEdit} className="text-green-600 hover:text-green-900">Salvar</button>
                                            <button onClick={() => setEditId(null)} className="text-gray-600 hover:text-gray-900">Cancelar</button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-center gap-4">
                                            <button onClick={() => startEdit(plano)} className="text-blue-600 hover:text-blue-900">Editar</button>
                                            <button onClick={() => handleDelete(plano.id)} className="text-red-600 hover:text-red-900">Excluir</button>
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
