const ChatPage = ({ chatData, navigateTo, user }) => {
    const { anuncioId, otherUserId } = chatData || {};
    const [messages, setMessages] = React.useState([]);
    const [newMessage, setNewMessage] = React.useState('');
    const [selectedImage, setSelectedImage] = React.useState(null);
    const [currentUser, setCurrentUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const messagesEndRef = React.useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(() => {
        scrollToBottom();
        // Only scroll when message count changes, not on every poll if data is same structure
    }, [messages.length]);

    React.useEffect(() => {
        if (!user) {
            navigateTo('login');
            return;
        }
        setCurrentUser(user);

        // Initial fetch
        fetchMessages();

        // Polling
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [anuncioId, otherUserId]);

    const fetchMessages = async () => {
        // Guard clause for missing IDs
        if (!anuncioId || !otherUserId) {
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/chat/messages/${anuncioId}/${otherUserId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !selectedImage) return;

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('destinatario_id', otherUserId);
            formData.append('anuncio_id', anuncioId);
            formData.append('conteudo', newMessage);
            if (selectedImage) {
                formData.append('imagem', selectedImage);
            }

            const res = await fetch('/api/chat/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                setNewMessage('');
                setSelectedImage(null);
                fetchMessages();
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="flex justify-center items-center py-4 min-h-[calc(100vh-100px)] bg-gray-100 font-sans">
            {/* Mobile Container - Compact Size */}
            <div className="w-full max-w-[320px] h-[550px] bg-[#efe7dd] rounded-[24px] shadow-2xl overflow-hidden border border-gray-300 flex flex-col relative">

                {/* Header */}
                <div className="bg-[#075e54] text-white p-2 flex items-center shadow-md z-10 shrink-0 h-14">
                    <button
                        onClick={() => navigateTo('inbox')}
                        className="mr-1 p-1 hover:bg-white/10 rounded-full transition flex items-center"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-bold mr-2 text-gray-600 text-xs">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="flex-col overflow-hidden">
                        <h3 className="font-bold text-xs truncate leading-tight">Usuário {otherUserId}</h3>
                        <p className="text-[9px] text-white/80 truncate">Anúncio #{anuncioId}</p>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-grow overflow-y-auto p-2 space-y-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-opacity-10 bg-[length:300px_auto]">
                    {loading && (
                        <div className="flex justify-center p-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#128c7e]"></div>
                        </div>
                    )}

                    {!loading && messages.length === 0 && (
                        <div className="text-center bg-[#dcf8c6] p-2 rounded mx-4 mt-4 text-[9px] text-gray-600 shadow-sm border border-green-100">
                            <p>🔒 Mensagens protegidas.</p>
                        </div>
                    )}

                    {messages.map(msg => {
                        const isMe = String(msg.remetente_id) === String(user?.id);
                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`
                                    max-w-[85%] rounded-lg px-2 py-1 shadow-sm text-xs relative
                                    ${isMe
                                        ? 'bg-[#dcf8c6] text-gray-800 rounded-tr-none'
                                        : 'bg-white text-gray-800 rounded-tl-none'
                                    }
                                `}>
                                    {msg.imagem && (
                                        <div className="mb-1">
                                            <img src={msg.imagem} alt="anexo" className="rounded max-w-full" />
                                        </div>
                                    )}
                                    <p className="whitespace-pre-wrap leading-snug text-xs">{msg.conteudo}</p>
                                    <div className="text-[8px] text-gray-500 text-right mt-0.5 ml-2 min-w-[35px] flex justify-end items-center">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {isMe && <span className="ml-0.5 text-[#4fb6ec] font-bold">✓✓</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-2 bg-[#f0f0f0] flex items-center gap-1.5 shrink-0">
                    {selectedImage && (
                        <div className="absolute bottom-14 left-2 bg-white p-2 rounded shadow-lg flex items-center gap-2 border border-gray-200">
                            <span className="text-[10px] truncate max-w-[100px]">{selectedImage.name}</span>
                            <button onClick={() => setSelectedImage(null)} className="text-red-500 font-bold px-1 text-xs">✕</button>
                        </div>
                    )}

                    <form onSubmit={handleSendMessage} className="flex gap-1.5 items-center w-full">
                        <label className="cursor-pointer p-1.5 text-gray-500 hover:text-gray-700 transition">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <input type="file" onChange={handleImageSelect} accept="image/*" className="hidden" />
                        </label>

                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Mensagem"
                            className="flex-grow py-1.5 px-3 bg-white rounded-full text-xs focus:outline-none shadow-sm h-8"
                        />

                        <button
                            type="submit"
                            disabled={!newMessage.trim() && !selectedImage}
                            className="bg-[#075e54] text-white p-1.5 rounded-full hover:bg-[#128c7e] transition shadow-sm disabled:opacity-70 flex items-center justify-center w-9 h-9 shrink-0"
                        >
                            <svg className="w-4 h-4 transform rotate-0 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>

            {/* Small Footer Debug for Parameters (Hidden mostly) */}
            <div className="text-[8px] text-gray-300 text-center mt-1 font-mono absolute bottom-2 w-full pointer-events-none opacity-0">
                {anuncioId} | {otherUserId}
            </div>
        </div>
    );
};
