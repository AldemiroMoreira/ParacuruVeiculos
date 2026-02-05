const SystemSetting = require('../models/SystemSetting');
const axios = require('axios');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const APP_ID = process.env.ML_APP_ID;
const SECRET = process.env.ML_CLIENT_SECRET;
const REDIRECT_URI = process.env.ML_REDIRECT_URI;

// Helper to base64url encode
function base64URLEncode(str) {
    return str.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function sha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest();
}

exports.getAuthUrl = (req, res) => {
    // Generate PKCE Verifier and Challenge
    const verifier = base64URLEncode(crypto.randomBytes(32));
    const challenge = base64URLEncode(sha256(verifier));

    const url = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&code_challenge=${challenge}&code_challenge_method=S256`;

    // Set code_verifier in cookie (HTTPOnly, Secure if possible)
    // Note: In production with SSL, Secure should be true. For now we use standard attributes.
    res.setHeader('Set-Cookie', `ml_code_verifier=${verifier}; Path=/; HttpOnly; Max-Age=600`); // 10 minutes

    res.json({ url });
};

exports.handleCallback = async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('Authorization code missing.');
    }

    // Retrieve code_verifier from cookie
    const cookies = req.headers.cookie;
    let codeVerifier = null;
    if (cookies) {
        const match = cookies.match(/ml_code_verifier=([^;]+)/);
        if (match) {
            codeVerifier = match[1];
        }
    }

    if (!codeVerifier) {
        return res.status(400).send('Session expired or invalid. Please try again (missing code_verifier).');
    }

    try {
        const response = await axios.post('https://api.mercadolibre.com/oauth/token',
            new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: APP_ID,
                client_secret: SECRET,
                code: code,
                redirect_uri: REDIRECT_URI,
                code_verifier: codeVerifier
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const { access_token, refresh_token, error } = response.data;

        if (error) {
            console.error('ML Auth Error:', error);
            return res.status(500).send(`Error: ${error}`);
        }

        // Save tokens
        await SystemSetting.upsert({ key: 'ml_access_token', value: access_token });
        await SystemSetting.upsert({ key: 'ml_refresh_token', value: refresh_token });

        // Clear cookie
        res.setHeader('Set-Cookie', 'ml_code_verifier=; Path=/; HttpOnly; Max-Age=0');

        console.log('ML Tokens saved successfully.');
        res.send('<h1>Conectado com sucesso!</h1><p>Você pode fechar esta janela.</p>');

    } catch (error) {
        console.error('Callback Error:', error.response ? error.response.data : error.message);
        res.status(500).json({
            message: 'Authentication failed.',
            details: error.response ? error.response.data : error.message,
            stack: error.stack
        });
    }
};
