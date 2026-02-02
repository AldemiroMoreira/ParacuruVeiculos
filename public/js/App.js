// DB CRUD Pages - Loaded via index.html globals
// import AdminLoginPage from './pages/db_crud/AdminLoginPage.js';
// import CategoriasCrudPage from './pages/db_crud/CategoriasCrudPage.js';

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

            default:
                return <HomePage navigateTo={navigateTo} />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header user={user} navigateTo={navigateTo} onLogout={handleLogout} />
            <main className="flex-grow container mx-auto px-4 py-8">
                {renderPage()}
            </main>
            <Footer navigateTo={navigateTo} />
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
