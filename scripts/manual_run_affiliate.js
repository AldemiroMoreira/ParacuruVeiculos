const { runAffiliateUpdate } = require('../backend/services/affiliateService');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

(async () => {
    console.log('Running manual affiliate update...');
    try {
        await runAffiliateUpdate();
        console.log('Done.');
        process.exit(0);
    } catch (err) {
        console.error('Failed:', err);
        process.exit(1);
    }
})();
