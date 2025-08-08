const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Admin Auth Routes
router.post('/auth/admin/login', adminAuthController.adminLogin);
router.post('/auth/admin/logout', adminAuthController.adminLogout);
router.get('/auth/admin/me', authMiddleware, adminMiddleware.adminOnly, adminAuthController.getMe);

// Admin User Management Routes
router.get('/admin/users', authMiddleware, adminMiddleware.adminOnly, adminController.getUsers);
router.get('/admin/users/:id', authMiddleware, adminMiddleware.adminOnly, adminController.getUser);
router.put('/admin/users/:id', authMiddleware, adminMiddleware.adminOnly, adminController.updateUser);
router.delete('/admin/users/:id', authMiddleware, adminMiddleware.adminOnly, adminController.deleteUser);

// Admin Auction Management Routes
router.get('/admin/auctions', authMiddleware, adminMiddleware.adminOnly, adminController.getAuctions);
router.get('/admin/auctions/:id/bids', authMiddleware, adminMiddleware.adminOnly, adminController.getAuctionBids);
router.put('/admin/auctions/:id/end', authMiddleware, adminMiddleware.adminOnly, adminController.endAuction);

// Admin Dashboard Route
router.get('/admin/dashboard', authMiddleware, adminMiddleware.adminOnly, adminController.getDashboardStats);

//products
router.get('/admin/products',authMiddleware, adminMiddleware.adminOnly, adminController.getAdminProductsList);




//admin management
router.get('/admin/admins', authMiddleware, adminMiddleware.adminOnly, adminController.getAdmins);
router.post('/admin/admins', authMiddleware, adminMiddleware.adminOnly, adminController.createAdmin);
router.put('/admin/admins/:id', authMiddleware, adminMiddleware.adminOnly, adminController.updateAdmin);
router.delete('/admin/admins/:id', authMiddleware, adminMiddleware.adminOnly, adminController.deleteAdmin);


module.exports = router;