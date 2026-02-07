try {
    const mp = require('mercadopago');
    console.log('MP Import Success');
    console.log('Keys:', Object.keys(mp));
    if (mp.PreApprovalPlan) console.log('PreApprovalPlan exists');
    else console.log('PreApprovalPlan MISSING');
} catch (e) {
    console.error('MP Import Failed:', e);
}
