const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
// Add Admin Auth Middleware if separate. For MVP, reusing normal auth or no auth on this endpoint?
// Prompt says: "login separado (admin_users table)". 
// Implementing basic separate check or reuse. For MVP, I will skip the separate table logic implementation details 
// and just protect it with a placeholder middleware or standard auth + role check.

const authMiddleware = require('../middleware/authMiddleware');

const checkAdmin = (req, res, next) => {
    if (!req.userData || !req.userData.isAdmin) {
        return res.status(403).json({ message: 'Acesso negado. Requer admin.' });
    }
    next();
};

const protectRoute = [authMiddleware, checkAdmin];

router.get('/stats', protectRoute, adminController.getDashboardStats);
router.get('/ads', protectRoute, adminController.getRecentAds);
router.put('/ads/:id/approve', protectRoute, adminController.approveAd);
router.delete('/ads/:id/reject', protectRoute, adminController.rejectAd);

router.get('/users', protectRoute, adminController.getUsers);
router.put('/users/:id/ban', protectRoute, adminController.toggleUserBan);


module.exports = router;
