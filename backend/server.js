const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Cron Jobs
const { initCron } = require('./services/cronService');
initCron();

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

// Routes
const authRoutes = require('./routes/authRoutes');
const anunciosRoutes = require('./routes/anunciosRoutes');
const pagamentosRoutes = require('./routes/pagamentosRoutes');
const adminRoutes = require('./routes/adminRoutes');
const locationsRoutes = require('./routes/locationsRoutes');
const resourcesRoutes = require('./routes/resourcesRoutes');
const chatRoutes = require('./routes/chatRoutes');
const favoritesRoutes = require('./routes/favoritesRoutes');
const propagandasRoutes = require('./routes/propagandasRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/anuncios', anunciosRoutes);
app.use('/api/pagamentos', pagamentosRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/propagandas', propagandasRoutes);

// DB CRUD / Admin Module
const dbCrudRoutes = require('./routes/db_crud/adminRoutes');
app.use('/api/db_crud', dbCrudRoutes);

// Database Test
const sequelize = require('./config/database');
sequelize.authenticate()
    .then(() => {
        console.log('Database connected...');
        // Sync models (alter: true creates/updates columns to match model definitions)
        return sequelize.sync({ alter: true });
    })
    .then(() => console.log('Database synced! (ALTER ENABLED)'))
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
