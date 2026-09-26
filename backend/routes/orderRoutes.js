const express = require('express');
const { createOrder, listOrders, updateOrder } = require('../controllers/orderController');
const { protectRoute, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', createOrder);
router.get('/', protectRoute, adminOnly, listOrders);
router.patch('/:id', protectRoute, adminOnly, updateOrder);

module.exports = router;
