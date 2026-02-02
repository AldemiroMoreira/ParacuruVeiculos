const ChatWidget = ({ user, toggleChat, isOpen }) => {
    const [view, setView] = React.useState('list'); // 'list' or 'chat'
    const [conversations, setConversations] = React.useState([]);
    const [activeChat, setActiveChat] = React.useState(null); // { anuncioId, otherUserId, otherUserName, anuncioTitle }
    const [messages, setMessages] = React.useState([]);
    const [newMessage, setNewMessage] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const messagesEndRef = React.useRef(null);
    const [unreadTotal, setUnreadTotal] = React.useState(0);

    // Initial load and polling for unread count
    React.useEffect(() => {
        if (user) {
            fetchConversations(); // Initial fetch
            const interval = setInterval(fetchConversations, 5000); // Poll for new conversations/unread
            return () => clearInterval(interval);
        }
    }, [user, isOpen]);

    // Poll messages when a chat is active
    React.useEffect(() => {
        if (activeChat && isOpen) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 3000);
            return () => clearInterval(interval);
        }
    }, [activeChat, isOpen]);

    // Auto-scroll to bottom
    React.useEffect(() => {
        if (view === 'chat') {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, view, isOpen]);

    const fetchConversations = async () => {
        if (!user) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/chat/conversations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setConversations(data);
                const total = data.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
                setUnreadTotal(total);
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
        }
    };

    const fetchMessages = async () => {
        if (!activeChat) return;
        try {
            const token = localStorage.getItem('token');
            const { anuncioId, otherUserId } = activeChat;
            const response = await fetch(`/api/chat/messages/${anuncioId}/${otherUserId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('destinatario_id', activeChat.otherUserId);
            formData.append('anuncio_id', activeChat.anuncioId);
            formData.append('conteudo', newMessage);

            const res = await fetch('/api/chat/send', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                setNewMessage('');
                fetchMessages();
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleOpenChat = (conv) => {
        setActiveChat({
            anuncioId: conv.anuncio.id,
            otherUserId: conv.otherUser.id,
            otherUserName: conv.otherUser.nome,
            anuncioTitle: conv.anuncio.titulo
        });
        setView('chat');
    };

    const handleBackToList = () => {
        setView('list');
        setActiveChat(null);
        fetchConversations(); // Refresh list to update unread counts potentially
    };

    if (!user) return null; // Don't show if not logged in (or maybe show login prompt?)

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end font-sans">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white w-[350px] h-[500px] mb-4 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-fade-in-up">
                    {/* Header */}
                    <div className="bg-brand-600 p-4 text-white flex items-center shadow-md z-10">
                        {view === 'chat' && (
                            <button onClick={handleBackToList} className="mr-3 hover:bg-brand-700 p-1 rounded-full transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}
                        <div className="flex-grow">
                            <h3 className="font-bold text-lg leading-tight">
                                {view === 'list' ? 'Mensagens' : activeChat?.otherUserName}
                            </h3>
                            {view === 'chat' && (
                                <p className="text-xs text-brand-100 truncate w-[200px]">{activeChat?.anuncioTitle}</p>
                            )}
                        </div>
                        <button onClick={toggleChat} className="ml-2 hover:bg-brand-700 p-1 rounded-full text-brand-100 hover:text-white transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-grow overflow-y-auto bg-gray-50 p-2">
                        {/* VIEW: LIST */}
                        {view === 'list' && (
                            <div className="space-y-2">
                                {conversations.length === 0 ? (
                                    <p className="text-center text-gray-400 mt-10 text-sm">Nenhuma conversa.<br />Inicie um chat na página de um anúncio.</p>
                                ) : (
                                    conversations.map(conv => (
                                        <div
                                            key={`${conv.anuncio.id}-${conv.otherUser.id}`}
                                            onClick={() => handleOpenChat(conv)}
                                            className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition flex items-center gap-3"
                                        >
                                            <div className="h-10 w-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold shrink-0">
                                                {conv.otherUser.nome.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <div className="flex justify-between items-baseline">
                                                    <h4 className="font-semibold text-gray-800 text-sm truncate">{conv.otherUser.nome}</h4>
                                                    <span className="text-[10px] text-gray-400">
                                                        {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 truncate">{conv.anuncio.titulo}</p>
                                                <div className="flex justify-between items-center mt-1">
                                                    <p className="text-xs text-gray-600 truncate flex-grow mr-2">
                                                        {conv.lastMessage.conteudo}
                                                    </p>
                                                    {conv.unreadCount > 0 && (
                                                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">
                                                            {conv.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* VIEW: CHAT */}
                        {view === 'chat' && (
                            <div className="space-y-3 pb-2">
                                {messages.map(msg => {
                                    const isMe = String(msg.remetente_id) === String(user.id);
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMe ? 'bg-brand-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                                }`}>
                                                <p>{msg.conteudo}</p>
                                                <div className={`text-[9px] text-right mt-1 ${isMe ? 'text-brand-100' : 'text-gray-400'}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Footer (Input) - Only in Chat View */}
                    {view === 'chat' && (
                        <div className="p-3 bg-white border-t border-gray-100">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Digite sua mensagem..."
                                    className="flex-grow bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                                />
                                <button type="submit" className="bg-brand-600 text-white p-2 rounded-full hover:bg-brand-700 transition shadow-lg disabled:opacity-50" disabled={!newMessage.trim()}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={toggleChat}
                className="bg-brand-600 hover:bg-brand-700 text-white rounded-full p-4 shadow-lg transition transform hover:scale-110 flex items-center justify-center relative group"
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {/* Unread Badge */}
                        {unreadTotal > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                {unreadTotal}
                            </span>
                        )}
                    </>
                )}
                {/* Tooltip */}
                {!isOpen && (
                    <span className="absolute right-full mr-3 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                        Fale com o suporte
                    </span>
                )}
            </button>
        </div>
    );
};
