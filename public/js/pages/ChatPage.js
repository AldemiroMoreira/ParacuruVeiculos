const ChatPage = ({ chatData, navigateTo, user }) => {
    const { anuncioId, otherUserId } = chatData || {};
    const [messages, setMessages] = React.useState([]);
    const [newMessage, setNewMessage] = React.useState('');
    const [selectedImage, setSelectedImage] = React.useState(null);
    const [currentUser, setCurrentUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    // Fetch messages periodically (simple polling)
    React.useEffect(() => {
        if (!user) {
            navigateTo('login');
            return;
        }
        setCurrentUser(user);

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000);

        return () => clearInterval(interval);
    }, [anuncioId, otherUserId]);

    const fetchMessages = async () => {
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
        <div className="container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div className="card" style={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
                <div className="card-header" style={{ borderBottom: '1px solid #eee', padding: '1rem' }}>
                    <h3>Chat</h3>
                    <button onClick={() => navigateTo('ad-detail', anuncioId)} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}>
                        &larr; Voltar
                    </button>
                </div>

                <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#f9f9f9', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {loading && <p>Carregando...</p>}
                    {!loading && messages.length === 0 && <p style={{ color: '#888', textAlign: 'center' }}>Nenhuma mensagem ainda.</p>}

                    {messages.map(msg => {
                        const isMe = msg.remetente_id === currentUser.id;
                        return (
                            <div key={msg.id} style={{
                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                maxWidth: '70%',
                                padding: '10px 15px',
                                borderRadius: '15px',
                                backgroundColor: isMe ? '#007bff' : '#e9ecef',
                                color: isMe ? 'white' : 'black',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                {msg.imagem && (
                                    <div style={{ marginBottom: '5px' }}>
                                        <img src={msg.imagem} alt="anexo" style={{ maxWidth: '200px', borderRadius: '10px' }} />
                                    </div>
                                )}
                                <div style={{ fontSize: '1rem' }}>{msg.conteudo}</div>
                                <div style={{ fontSize: '0.7rem', opacity: 0.8, textAlign: 'right', marginTop: '5px' }}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="chat-input" style={{ padding: '1rem', borderTop: '1px solid #eee' }}>
                    {selectedImage && (
                        <div style={{ marginBottom: '10px', fontSize: '0.8rem', color: '#666' }}>
                            Imagem selecionada: {selectedImage.name}
                            <button onClick={() => setSelectedImage(null)} style={{ marginLeft: '10px', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>X</button>
                        </div>
                    )}
                    <form onSubmit={handleSendMessage} style={{ display: 'flex', width: '100%', gap: '10px', alignItems: 'center' }}>
                        <label style={{ cursor: 'pointer', padding: '10px', backgroundColor: '#eee', borderRadius: '5px' }}>
                            📷
                            <input type="file" onChange={handleImageSelect} accept="image/*" style={{ display: 'none' }} />
                        </label>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Digite sua mensagem..."
                            style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                        />
                        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                            Enviar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
