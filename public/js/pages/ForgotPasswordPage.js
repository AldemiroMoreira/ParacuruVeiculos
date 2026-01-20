const ForgotPasswordPage = ({ navigateTo }) => {
    const [email, setEmail] = React.useState('');
    const [step, setStep] = React.useState('request'); // request, sent

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/forgot-password', { email });
            setStep('sent');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Erro ao enviar email. Tente novamente.');
        }
    };

    return (
        <div className="max-w-xs mx-auto mt-10 bg-white p-5 rounded-xl shadow-lg border border-gray-100 fade-in">
            <h2 className="text-xl font-bold text-center mb-4 text-gray-900">Recuperar Senha</h2>

            {step === 'request' ? (
                <>
                    <p className="text-sm text-gray-600 text-center mb-4">
                        Digite seu email para recebermos um link de redefinição.
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="w-full bg-brand-600 text-white py-2 rounded-lg font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/30 text-sm">
                            Enviar Link
                        </button>
                    </form>
                </>
            ) : (
                <div className="text-center">
                    <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">
                        Enviamos um email para <strong>{email}</strong> com instruções.
                    </div>
                    <p className="text-xs text-gray-500 mb-4">Verifique sua caixa de entrada e spam.</p>
                </div>
            )}

            <button
                type="button"
                onClick={() => navigateTo('login')}
                className="w-full text-brand-600 mt-4 py-2 text-sm hover:text-brand-800 font-medium hover:underline"
            >
                Voltar para o Login
            </button>
        </div>
    );
};
