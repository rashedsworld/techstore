const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  sku: { type: String, required: true },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity cannot be less than 1'],
    default: 1,
  },
  price: { type: Number, required: true },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Null for guest sessions
    },
    sessionId: {
      type: String,
      default: null, // Cookie-based guest token
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

// Indexed to allow rapid retrieval by either user ID or guest sessionId
cartSchema.index({ user: 1, sessionId: 1 });

module.exports = mongoose.model('Cart', cartSchema);