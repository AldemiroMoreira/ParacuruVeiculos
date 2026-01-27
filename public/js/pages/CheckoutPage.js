const CheckoutPage = ({ checkoutData, navigateTo }) => {
    const [loading, setLoading] = React.useState(false);
    const [planDetails, setPlanDetails] = React.useState(null);

    // Get props passed from CreateAdPage
    const { adId, planId } = checkoutData || {};

    React.useEffect(() => {
        if (!adId || !planId) {
            alert('Nenhum anuncio pendente de pagamento.');
            navigateTo('home');
            return;
        }

        // Fetch Plan Details to show correct price
        api.get('/resources/planos')
            .then(res => {
                // Ensure type safety when finding plan. planId might be string, ID usually int.
                const plan = res.data.find(p => p.id == planId);
                if (plan) {
                    setPlanDetails(plan);
                } else {
                    console.warn(`Plan ${planId} not found in resources.`);
                }
            })
            .catch(console.error);

    }, [adId, planId]);

    const handlePay = async () => {
        setLoading(true);
        try {
            const response = await api.post('/pagamentos/preference', { anuncioId: adId, planId });
            const { init_point, sandbox_init_point } = response.data;

            // Redirect to Mercado Pago
            // Use sandbox for testing if needed, or production init_point
            window.location.href = sandbox_init_point || init_point;

        } catch (error) {
            console.error(error);
            alert('Erro ao iniciar pagamento.');
            setLoading(false);
        }
    };

    // Calculate Price for display
    const price = planDetails ? Number(planDetails.preco) : 0;
    const planName = planDetails ? `${planDetails.nome} (${planDetails.duracao_dias} dias)` : 'Carregando...';

    return (
        <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-2xl shadow-lg border border-gray-100 fade-in text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Anúncio Criado!</h2>
            <p className="text-gray-500 mb-8">Conclua o pagamento para publicar seu veículo.</p>

            <div className="bg-gray-50 p-6 rounded-xl mb-8 text-left">
                <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Plano</span>
                    <span className="font-semibold">{planName}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 border-t border-gray-200 pt-4 mt-2">
                    <span>Total</span>
                    <span>R$ {price.toFixed(2)}</span>
                </div>
            </div>

            <button onClick={handlePay} disabled={loading} className="w-full bg-[#009EE3] text-white py-4 rounded-xl font-bold hover:bg-[#007cb3] transition-colors shadow-lg shadow-blue-400/30 flex items-center justify-center gap-2">
                {loading ? 'Processando...' : 'Pagar com Mercado Pago'}
            </button>
            <p className="text-xs text-gray-400 mt-4">Ambiente Seguro. Aceitamos Pix e Cartões.</p>
        </div>
    );
};
