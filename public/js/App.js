// DB CRUD Pages - Loaded via index.html globals
// import AdminLoginPage from './pages/db_crud/AdminLoginPage.js';
// import CategoriasCrudPage from './pages/db_crud/CategoriasCrudPage.js';
// import CategoriasCrudPage from './pages/db_crud/CategoriasCrudPage.js';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("React ErrorBoundary caught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-xl w-full bg-white shadow-xl rounded-lg p-8">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Algo deu errado (Client-Side Error)</h1>
                        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-mono overflow-auto max-h-40">
                            {this.state.error && this.state.error.toString()}
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition">
                                Recarregar Página
                            </button>
                            <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-bold transition">
                                Limpar Dados e Ir para Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const App = () => {
    const [currentPage, setCurrentPage] = React.useState('home');
    const [user, setUser] = React.useState(null);
    const [currentAdId, setCurrentAdId] = React.useState(null);
    const [checkoutData, setCheckoutData] = React.useState(null);
    const [chatData, setChatData] = React.useState(null); // Added chatData state

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            setUser(JSON.parse(userData));
        }

        // Initial Routing based on Hash
        const handleInitialHash = () => {
            const hash = window.location.hash;
            if (hash.startsWith('#/reset-password/')) setCurrentPage('reset-password');
            else if (hash.startsWith('#/ml-auth')) setCurrentPage('ml-auth');
            else if (hash.startsWith('#/my-ads')) setCurrentPage('my-ads');
            else if (hash.startsWith('#/activate/')) setCurrentPage('activate');
            else if (hash.startsWith('#/edit-ad/')) setCurrentPage('edit-ad');
            else if (hash.startsWith('#/ad-detail/')) {
                const id = hash.split('/')[2];
                if (id) {
                    setCurrentAdId(id);
                    setCurrentPage('ad-detail');
                }
            }
            else if (hash.startsWith('#/chat/')) {
                const parts = hash.split('/');
                // Format: #/chat/anuncioId/otherUserId
                if (parts.length >= 4) {
                    const aid = parts[2];
                    const uid = parts[3];
                    setChatData({ anuncioId: aid, otherUserId: uid });
                    setCurrentPage('chat');
                }
            }
            else if (hash === '#/admin' || hash.startsWith('#/admin/')) {
                setCurrentPage('admin');
            }
            // else default is home (state init)
        };

        handleInitialHash();

        // Back Button Handler
        const handlePopState = (event) => {
            if (event.state && event.state.page) {
                if (event.state.page === 'ad-detail' && event.state.data) setCurrentAdId(event.state.data);
                if (event.state.page === 'checkout' && event.state.data) setCheckoutData(event.state.data);
                if (event.state.page === 'chat' && event.state.data) setChatData(event.state.data); // Restore chatData

                setCurrentPage(event.state.page);
            } else {
                // Fallback if no state (e.g. external back to initial load)
                handleInitialHash();
                if (!window.location.hash) setCurrentPage('home');
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
        setCurrentPage('home');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setCurrentPage('home');
        window.history.pushState(null, '', '/');
    };

    const navigateTo = (page, data = null) => {
        if (page === 'ad-detail') setCurrentAdId(data);
        if (page === 'checkout') setCheckoutData(data);
        if (page === 'chat') setChatData(data); // Set chatData

        // Construct Hash URL
        let hash = `#/${page}`;
        if (page === 'chat' && data) {
            hash += `/${data.anuncioId}/${data.otherUserId}`;
        } else if (data && typeof data !== 'object') {
            hash += `/${data}`;
        }

        // Push to History
        window.history.pushState({ page, data }, '', hash);

        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage navigateTo={navigateTo} user={user} />;
            case 'login':
                return <LoginPage onLogin={handleLogin} navigateTo={navigateTo} />;
            case 'register':
                return <RegisterPage navigateTo={navigateTo} />;
            case 'my-ads':
                return <MyAdsPage navigateTo={navigateTo} user={user} />;
            case 'create-ad':
                return <CreateAdPage navigateTo={navigateTo} user={user} />;
            case 'edit-ad':
                return <EditAdPage navigateTo={navigateTo} user={user} />;
            case 'ad-detail':
                return <AdDetailPage adId={currentAdId} navigateTo={navigateTo} user={user} />;
            case 'checkout':
                return <CheckoutPage checkoutData={checkoutData} navigateTo={navigateTo} user={user} />;
            case 'admin':
                return <AdminPage navigateTo={navigateTo} user={user} />;

            case 'forgot-password':
                return <ForgotPasswordPage navigateTo={navigateTo} />;
            case 'reset-password':
                return <ResetPasswordPage navigateTo={navigateTo} />;
            case 'activate':
                return <ActivationPage navigateTo={navigateTo} />;
            case 'chat':
                return <ChatPage chatData={chatData} navigateTo={navigateTo} user={user} />; // Pass chatData state, not currentAdId
            case 'inbox':
                return <InboxPage navigateTo={navigateTo} user={user} />;
            case 'favorites':
                return <FavoritesPage navigateTo={navigateTo} user={user} />;
            case 'profile':
                return <ProfilePage navigateTo={navigateTo} user={user} />;

            // DB CRUD Routes
            case 'db_crud_login':
                return <AdminLoginPage navigateTo={navigateTo} />;
            case 'db_crud_categorias':
                return <CategoriasCrudPage navigateTo={navigateTo} />;
            case 'db_crud_planos':
                return <PlanosCrudPage navigateTo={navigateTo} />;
            case 'db_crud_fabricantes':
                return <FabricantesCrudPage navigateTo={navigateTo} />;
            case 'db_crud_modelos':
                return <ModelosCrudPage navigateTo={navigateTo} />;
            case 'db_crud_anuncios':
                return <AnunciosCrudPage navigateTo={navigateTo} />;
            case 'db_crud_users':
                return <UsersCrudPage navigateTo={navigateTo} />;
            case 'ml-auth':
                return <MLAuthPage />;

            default:
                return <HomePage navigateTo={navigateTo} />;
        }
    };

    return (
        <ErrorBoundary>
            <div className="min-h-screen flex flex-col">
                <Header user={user} navigateTo={navigateTo} onLogout={handleLogout} />
                <main className="flex-grow container mx-auto px-4 py-8">
                    {renderPage()}
                </main>
                <Footer navigateTo={navigateTo} />
            </div>
        </ErrorBoundary>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
