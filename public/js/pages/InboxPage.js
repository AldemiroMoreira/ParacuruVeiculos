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
        <div className="flex justify-center items-center py-4 min-h-[calc(100vh-100px)] bg-gray-100 font-sans">
            {/* Mobile Container - Compact Size */}
            <div className="w-full max-w-[320px] h-[550px] bg-white rounded-[24px] shadow-2xl overflow-hidden border border-gray-300 flex flex-col relative">

                {/* Header */}
                <div className="bg-[#075e54] text-white p-3 flex items-center shadow-md z-10 shrink-0">
                    <h1 className="text-base font-bold flex-grow">Conversas</h1>
                    <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-[10px] font-bold">
                        {user?.nome?.charAt(0).toUpperCase()}
                    </div>
                </div>

                {/* List Container */}
                <div className="flex-grow overflow-y-auto bg-white">
                    {loading && (
                        <div className="flex justify-center p-4">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#128c7e]"></div>
                        </div>
                    )}

                    {!loading && conversations.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
                            <p className="text-xs">Nenhuma conversa iniciada.</p>
                        </div>
                    )}

                    {conversations.map(conv => (
                        <div
                            key={conv.key || `${conv.anuncio.id}-${conv.otherUser.id}`}
                            onClick={() => navigateTo('chat', { anuncioId: conv.anuncio.id, otherUserId: conv.otherUser.id })}
                            className="flex items-center p-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors"
                        >
                            {/* Avatar */}
                            <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-500 font-bold text-sm mr-2.5 overflow-hidden">
                                {conv.otherUser.nome ? conv.otherUser.nome.charAt(0).toUpperCase() : '?'}
                            </div>

                            {/* Content */}
                            <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-semibold text-gray-900 truncate text-xs">
                                        {conv.otherUser.nome}
                                    </h3>
                                    <span className={`text-[9px] ${conv.unreadCount > 0 ? 'text-[#25d366] font-bold' : 'text-gray-400'}`}>
                                        {new Date(conv.lastMessage.created_at).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center mt-0.5">
                                    <p className="text-[10px] text-gray-500 truncate max-w-[160px]">
                                        {conv.lastMessage.conteudo}
                                    </p>

                                    {conv.unreadCount > 0 && (
                                        <div className="bg-[#25d366] text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full ml-1">
                                            {conv.unreadCount}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
