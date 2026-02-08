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
    // Check if bot is active
    try {
        const setting = await SystemSetting.findByPk('ml_bot_active');
        if (!setting || setting.value !== 'true') {
            console.log('[Affiliate Bot] SKIPPING: Bot is disabled in settings.');
            return;
        }
    } catch (e) {
        console.error('[Affiliate Bot] Error checking status:', e.message);
        return;
    }

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

        // Filter valid items and keep their type
        const validItems = highlightItems
            .filter(i => i.id && i.id.startsWith('MLB') && !i.id.startsWith('MLBU'))
            .slice(0, 15); // Process top 15

        console.log(`[Affiliate Bot] Processing ${validItems.length} valid items sequentially...`);
        console.log(`[Debug] DB Host: ${process.env.DB_HOST}, DB Name: ${process.env.DB_NAME}`);

        let addedCount = 0;

        for (const itemData of validItems) {
            try {
                let title, imageUrl, affiliateLink, price;

                // Handle Catalog Products (TYPE: PRODUCT)
                if (itemData.type === 'PRODUCT') {
                    const productRes = await axios.get(`${ML_API_URL}/products/${itemData.id}`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        }
                    });
                    const p = productRes.data;
                    title = p.name;
                    imageUrl = p.pictures?.[0]?.url;
                    affiliateLink = `https://www.mercadolivre.com.br/p/${itemData.id}`; // Construct Catalog URL
                    // Catalog products don't always have a single price, usually a range. 
                    // We might need to fetch a 'buy_box_winner' price if available, or just leave it 0/null?
                    // Let's try to find a price if possible, or use 0.
                    // The 'pickers' or 'buy_box_winner' might be in the response but typically require 'items' to get price.
                    // For now, we accept 0 or generic price.
                    price = 0; // We can't easily get the live price of a catalog product without checking sellers.

                } else {
                    // Handle Standard Listings (TYPE: ITEM) - LIKELY TO FAIL IN TEST MODE
                    // But we keep the logic just in case provided token works for some.
                    const itemRes = await axios.get(`${ML_API_URL}/items/${itemData.id}`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        }
                    });
                    const i = itemRes.data;
                    title = i.title;
                    imageUrl = i.thumbnail;
                    affiliateLink = i.permalink;
                    price = i.price;
                }

                if (!affiliateLink) continue;

                // Ensure HTTPS in image
                if (imageUrl) imageUrl = imageUrl.replace('http://', 'https://');

                const exists = await Propaganda.findOne({ where: { link_destino: affiliateLink } });

                if (!exists) {
                    await Propaganda.create({
                        titulo: (title || 'Produto sem título').substring(0, 255),
                        imagem_url: imageUrl || '',
                        link_destino: affiliateLink,
                        localizacao: 'sidebar',
                        preco: price || 0,
                        ativo: true
                    });
                    console.log(`[Affiliate Bot] Added (${itemData.type}): ${title}`);
                    addedCount++;
                } else {
                    if (exists.localizacao !== 'sidebar') {
                        await exists.update({ localizacao: 'sidebar' });
                    }
                }

                // Politeness delay
                await new Promise(r => setTimeout(r, 500));

            } catch (err) {
                console.warn(`[Affiliate Bot] Failed to fetch ${itemData.id} (${itemData.type}): ${err.message}`);
                // if (err.response && err.response.status === 403) {
                //     console.warn('403 Forbidden. Skipping.');
                // }
            }
        }

        console.log(`[Affiliate Bot] Update complete. Added ${addedCount} new ads.`);

    } catch (error) {
        console.error('[Affiliate Bot] Error:', error.message);
        if (error.response) console.error('Details:', error.response.data);
    }
};
