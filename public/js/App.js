// DB CRUD Pages - Loaded via index.html globals
// import AdminLoginPage from './pages/db_crud/AdminLoginPage.js';
// import CategoriasCrudPage from './pages/db_crud/CategoriasCrudPage.js';

const App = () => {
    const [currentPage, setCurrentPage] = React.useState('home');
    const [user, setUser] = React.useState(null);
    const [currentAdId, setCurrentAdId] = React.useState(null);
    const [checkoutData, setCheckoutData] = React.useState(null);

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            setUser(JSON.parse(userData));
        }

        // Hash Routing Check
        const hash = window.location.hash;
        if (hash.startsWith('#/reset-password/')) {
            setCurrentPage('reset-password');
        }
        if (hash.startsWith('#/my-ads')) { // Handle payment return
            setCurrentPage('my-ads');
        }
        if (hash.startsWith('#/activate/')) {
            setCurrentPage('activate');
        }
        if (hash.startsWith('#/edit-ad/')) {
            setCurrentPage('edit-ad');
        }
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
    };

    const navigateTo = (page, data = null) => {
        if (page === 'ad-detail') setCurrentAdId(data);
        if (page === 'checkout') setCheckoutData(data);
        if (page === 'edit-ad') {
            // For edit-ad, the data is the ID, so we might want to update the URL hash
            // But actually, simple navigation 'internally' is easier. 
            // However, EditAdPage checks window.location.hash. 
            // So we should update it.
            window.location.hash = `/edit-ad/${data}`;
        }
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
                return <ChatPage chatData={currentAdId} navigateTo={navigateTo} user={user} />;
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
            <Footer />
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
