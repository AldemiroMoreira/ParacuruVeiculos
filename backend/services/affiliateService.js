const axios = require('axios');
const { Propaganda, SystemSetting } = require('../models');
const { Op } = require('sequelize');

const ML_API_URL = 'https://api.mercadolibre.com';
const CATEGORY_ID = 'MLB5672';
const APP_ID = process.env.ML_APP_ID;
const CLIENT_SECRET = process.env.ML_CLIENT_SECRET;

async function getAccessToken() {
    // 1. Try to get from DB
    let tokenRecord = await SystemSetting.findByPk('ml_access_token');
    let refreshRecord = await SystemSetting.findByPk('ml_refresh_token');

    if (!tokenRecord || !refreshRecord) {
        throw new Error('ML Tokens not found. Please authorize via /ml-auth.');
    }

    // We assume token might be expired, so let's try to use it.
    // Ideally we store expiration, but for simplicity we can try and if 401, refresh.
    // Or just refresh every time if we run daily (tokens last 6 hours usually).

    // BETTER: Just refresh it to be safe since we run once a day.
    console.log('[Affiliate Bot] Refreshing token...');
    try {
        const response = await axios.post('https://api.mercadolibre.com/oauth/token',
            new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: APP_ID,
                client_secret: CLIENT_SECRET,
                refresh_token: refreshRecord.value
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const { access_token, refresh_token: new_refresh } = response.data;

        // Update DB
        await SystemSetting.upsert({ key: 'ml_access_token', value: access_token });
        await SystemSetting.upsert({ key: 'ml_refresh_token', value: new_refresh });

        return access_token;

    } catch (error) {
        console.error('Error refreshing token:', error.response ? error.response.data : error.message);
        // Fallback: return old token (might work if valid)
        return tokenRecord.value;
    }
}

exports.runAffiliateUpdate = async () => {
    console.log('[Affiliate Bot] Starting daily update (User Context)...');

    if (!APP_ID || !CLIENT_SECRET) {
        console.warn('[Affiliate Bot] SKIPPING: Missing ML credentials.');
        return;
    }

    try {
        const accessToken = await getAccessToken();

        console.log('[Affiliate Bot] Fetching trending products...');

        // STRATEGY: Highlights (proven to connect) -> Individual Public Fetch
        console.log('[Affiliate Bot] Fetching highlights...');

        let highlightItems = [];
        try {
            const highlightsResponse = await axios.get(`${ML_API_URL}/highlights/MLB/category/${CATEGORY_ID}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            highlightItems = highlightsResponse.data.content || [];
        } catch (e) {
            console.error('[Affiliate Bot] Error fetching highlights:', e.message);
        }

        if (highlightItems.length === 0) {
            console.log('[Affiliate Bot] No highlights found.');
            return;
        }

        console.log(`[Affiliate Bot] Found ${highlightItems.length} highlights directly.`);

        // Filter valid MLB IDs (Standard items, avoid 'MLBU' used items for now if problematic)
        const validIds = highlightItems
            .map(i => i.id)
            .filter(id => id && id.startsWith('MLB') && !id.startsWith('MLBU'))
            .slice(0, 15); // Process top 15

        console.log(`[Affiliate Bot] Processing ${validIds.length} valid MLB items sequentially...`);
        console.log(`[Debug] DB Host: ${process.env.DB_HOST}, DB Name: ${process.env.DB_NAME}`);

        let addedCount = 0;

        for (const itemId of validIds) {
            try {
                // Fetch public item details individually to avoid batch Auth requirement
                const itemRes = await axios.get(`${ML_API_URL}/items/${itemId}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                });

                const item = itemRes.data;
                const affiliateLink = item.permalink;

                if (!affiliateLink) continue;

                const exists = await Propaganda.findOne({ where: { link_destino: affiliateLink } });

                if (!exists) {
                    await Propaganda.create({
                        titulo: (item.title || 'Produto sem título').substring(0, 255),
                        imagem_url: (item.thumbnail || item.pictures?.[0]?.url || '').replace('http://', 'https://'),
                        link_destino: affiliateLink,
                        localizacao: 'sidebar',
                        ativo: true
                    });
                    console.log(`[Affiliate Bot] Added: ${item.title}`);
                    addedCount++;
                } else {
                    if (exists.localizacao !== 'sidebar') {
                        await exists.update({ localizacao: 'sidebar' });
                    }
                }

                // Politeness delay
                await new Promise(r => setTimeout(r, 500));

            } catch (err) {
                console.warn(`[Affiliate Bot] Failed to fetch item ${itemId}: ${err.message}`);
                if (err.response && err.response.status === 403) {
                    console.warn('403 Forbidden on item. Skipping.');
                }
            }
        }

        console.log(`[Affiliate Bot] Update complete. Added ${addedCount} new ads.`);

    } catch (error) {
        console.error('[Affiliate Bot] Error:', error.message);
        if (error.response) console.error('Details:', error.response.data);
    }
};
