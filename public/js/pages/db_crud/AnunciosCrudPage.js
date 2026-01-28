const AnunciosCrudPage = ({ navigateTo }) => {
    const [ads, setAds] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            navigateTo('db_crud_login');
            return;
        }
        fetchAds();
    }, []);

    const fetchAds = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            // Reusing admin/ads endpoint which brings all ads
            const res = await axios.get('/api/admin/ads/all', {
                headers: { Authorization: 'Bearer ' + token }
            });
            setAds(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            alert('Erro ao carregar anúncios');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza absoluta que deseja excluir este anúncio do banco de dados?')) return;
        try {
            const token = localStorage.getItem('admin_token');
            // Using admin specific delete if usually available, or generic delete
            // Logic: generic deleteAnuncio checks ownership OR admin if we update controller
            // Current deleteAnuncio in controller checks `where: { id, usuario_id: userId }` <-- this prevents admin from deleting other's ads via generic endpoint unless we fix controller.

            // Wait, admin page uses `/api/admin/ads/:id/reject` to "delete" (reject). 
            // The user might want a HARD delete.
            // Let's rely on the reject/delete logic. 
            // Better: use the specific `deleteAnuncio` but we need to ensure admin can bypass ownership check.

            // Let's try the generic delete first, but if it fails, we might need to modify controller.
            // For now, let's use the 'reject' endpoint which essentially deletes.
            await axios.delete(`/api/admin/ads/${id}/reject`, { headers: { Authorization: 'Bearer ' + token } });

            setAds(ads.filter(a => a.id !== id));
            alert('Anúncio excluído!');
        } catch (error) {
            alert('Erro ao excluir: ' + (error.response?.data?.error || error.message));
        }
    };

    if (loading) return <div className="p-10 text-center">Carregando...</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '40px auto', fontFamily: 'Arial, sans-serif' }} className="p-4 bg-white shadow rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gerenciar Anúncios</h1>
                <div className="space-x-4 text-sm">
                    <button onClick={() => navigateTo('admin')} className="font-bold text-gray-800 hover:text-blue-600">
                        ← Painel
                    </button>
                    <span className="text-gray-300">|</span>
                    <button onClick={() => navigateTo('db_crud_categorias')} className="text-gray-600 hover:text-blue-600">Categorias</button>
                    <span className="text-gray-300">|</span>
                    <button onClick={() => navigateTo('db_crud_fabricantes')} className="text-gray-600 hover:text-blue-600">Fabricantes</button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {ads.map(ad => (
                            <tr key={ad.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ad.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ad.titulo}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">R$ {ad.preco}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-xs">
                                    {ad.Usuario?.nome} <br /> ({ad.Usuario?.email})
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${ad.status === 'active' ? 'bg-green-100 text-green-700' :
                                        ad.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100'
                                        }`}>
                                        {ad.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={() => navigateTo('edit-ad', ad.id)}
                                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(ad.id)}
                                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-xs"
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
