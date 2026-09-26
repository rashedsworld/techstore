const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper to find cart by User ID or Session ID
const findCart = async (req) => {
  if (req.user) {
    return await Cart.findOne({ user: req.user._id });
  }
  const sessionId = req.cookies.sessionId || req.headers['x-session-id'];
  if (sessionId) {
    return await Cart.findOne({ sessionId });
  }
  return null;
};

// @desc    Get user or guest cart
// @route   GET /api/cart
// @access  Public
exports.getCart = async (req, res) => {
  try {
    const cart = await findCart(req);
    if (!cart) {
      return res.status(200).json({ items: [] });
    }
    await cart.populate('items.product', 'name images basePrice');
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving cart', error: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Public
exports.addToCart = async (req, res) => {
  try {
    const { productId, sku, quantity } = req.body;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const variant = product.variants.find((v) => v.sku === sku);
    const itemPrice = variant ? variant.price : product.basePrice;

    let cart = await findCart(req);

    if (!cart) {
      const sessionId = req.cookies.sessionId || req.headers['x-session-id'] || require('crypto').randomBytes(16).toString('hex');
      cart = new Cart({
        user: req.user ? req.user._id : null,
        sessionId: req.user ? null : sessionId,
        items: [],
      });
      res.cookie('sessionId', sessionId, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.sku === sku
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += Number(quantity);
    } else {
      cart.items.push({
        product: productId,
        sku,
        quantity: Number(quantity),
        price: itemPrice,
      });
    }

    await cart.save();
    await cart.populate('items.product', 'name images basePrice');
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart', error: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Public
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await findCart(req);
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error removing item from cart', error: error.message });
  }
};