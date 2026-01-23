const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Upload Limit
app.use(express.json({ limit: '10mb' }));

// Static Files (Frontend)
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/imgs', express.static(path.join(__dirname, '../public/imgs')));

console.log('[DEBUG] Starting server initialization...');

// Routes
console.log('[DEBUG] Loading authRoutes...');
const authRoutes = require('./routes/authRoutes');
console.log('[DEBUG] Loading anunciosRoutes...');
const anunciosRoutes = require('./routes/anunciosRoutes');
console.log('[DEBUG] Loading pagamentosRoutes...');
const pagamentosRoutes = require('./routes/pagamentosRoutes');
console.log('[DEBUG] Loading adminRoutes...');
const adminRoutes = require('./routes/adminRoutes');
console.log('[DEBUG] Loading locationsRoutes...');
const locationsRoutes = require('./routes/locationsRoutes');
console.log('[DEBUG] Loading resourcesRoutes...');
const resourcesRoutes = require('./routes/resourcesRoutes');
console.log('[DEBUG] Loading chatRoutes...');
const chatRoutes = require('./routes/chatRoutes');
console.log('[DEBUG] Loading favoritesRoutes...');
const favoritesRoutes = require('./routes/favoritesRoutes');
console.log('[DEBUG] Loading propagandasRoutes...');
const propagandasRoutes = require('./routes/propagandasRoutes');

console.log('[DEBUG] Registering middleware routes...');
app.use('/api/auth', authRoutes);
app.use('/api/anuncios', anunciosRoutes);
app.use('/api/pagamentos', pagamentosRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/propagandas', propagandasRoutes);

// Database Test
console.log('[DEBUG] initializing DB connection...');
const sequelize = require('./config/database');
sequelize.authenticate()
    .then(() => {
        console.log('Database connected...');
        // Sync models (create tables if missing, but don't force alter existing ones to avoid errors)
        return sequelize.sync();
    })
    .then(() => console.log('Database synced!'))
    .catch(err => console.log('Error: ' + err));

// Fallback for SPA (Single Page Application)
// This ensures that refreshing a page like /login works by serving index.html
app.get('*', (req, res) => {
    // API routes should have already been handled above, preventing this catch-all from swallowing API 404s
    // But good to be careful.
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: 'API Route Not Found' });
    }
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
