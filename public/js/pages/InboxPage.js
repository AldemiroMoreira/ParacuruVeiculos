const InboxPage = ({ navigateTo, user }) => {
    const [conversations, setConversations] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!user) {
            navigateTo('login');
            return;
        }
        fetchConversations();
    }, [user]);

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/chat/conversations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setConversations(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 fade-in max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">Minhas Conversas</h2>

            {loading && <p>Carregando...</p>}
            {!loading && conversations.length === 0 && <p className="text-gray-500">Você não tem conversas ainda.</p>}

            <div className="space-y-4">
                {conversations.map(conv => (
                    <div
                        key={conv.key}
                        onClick={() => navigateTo('chat', { anuncioId: conv.anuncio.id, otherUserId: conv.otherUser.id })}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition flex items-center justify-between"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold">
                                {conv.otherUser.nome ? conv.otherUser.nome.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">{conv.anuncio.titulo}</h4>
                                <p className="text-sm text-gray-500">Com: {conv.otherUser.nome}</p>
                                <p className="text-sm text-gray-400 truncate max-w-md">{conv.lastMessage.conteudo}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-400 mb-1">
                                {new Date(conv.lastMessage.created_at).toLocaleDateString()}
                            </span>
                            {conv.unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {conv.unreadCount} nova(s)
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
