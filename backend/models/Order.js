const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String, required: true },
  sku: { type: String, required: true },
  productCode: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    productCode: { type: String, required: true, trim: true, uppercase: true },
    customerAddress: { type: String, required: true, trim: true },
    orderItems: [orderItemSchema],
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'Cash on Delivery',
    },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    codFee: { type: Number, required: true, default: 100 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: Date,
    cashCollectedAt: Date,
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    trackingNumber: { type: String, default: '' },
    deliveredAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);