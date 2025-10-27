import { Router } from 'express';

const router = Router();

// Import auth routes
import authRoutes from './auth.js';
import adminRoutes from './admin.js';
import buyerRoutes from './buyer.js';
import sellerRoutes from './seller.js';
import deliveryRoutes from './delivery.js';
import publicRoutes from './public.js';

// Mount public routes (no authentication required)
router.use('/public', publicRoutes);

// Mount auth routes
router.use('/auth', authRoutes);

// Mount admin routes
router.use('/admin', adminRoutes);

// Mount buyer routes
router.use('/buyer', buyerRoutes);

// Mount seller routes
router.use('/seller', sellerRoutes);

// Mount delivery routes
router.use('/delivery', deliveryRoutes);

// Example placeholder endpoints
router.get('/hello', (req, res) => {
  res.json({ message: 'Hello from Pasalubong API v1' });
});

router.post('/echo', (req, res) => {
  res.json({ youSent: req.body });
});

export default router;