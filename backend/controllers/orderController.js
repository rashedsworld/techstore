const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

const orderStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const orderError = (statusCode, message) => Object.assign(new Error(message), { statusCode });

exports.createOrder = async (req, res) => {
  const reservedItems = [];

  try {
    const { customerName, customerPhone, productCode, address, orderItems } = req.body;
    const name = String(customerName || '').trim();
    const phone = String(customerPhone || '').trim();
    const customerAddress = String(address || '').trim();
    const enteredCodes = String(productCode || '').split(',').map((code) => code.trim().toUpperCase()).filter(Boolean);

    if (name.length < 2 || name.length > 100) {
      throw orderError(400, 'Enter your name (2 to 100 characters).');
    }
    if (!/^\+?[0-9().\s-]{7,24}$/.test(phone)) {
      throw orderError(400, 'Enter a valid phone number.');
    }
    if (customerAddress.length < 8 || customerAddress.length > 500) {
      throw orderError(400, 'Enter your full delivery address (8 to 500 characters).');
    }
    if (!Array.isArray(orderItems) || orderItems.length === 0 || orderItems.length > 20) {
      throw orderError(400, 'Your cart must contain between 1 and 20 items.');
    }
    if (enteredCodes.length !== orderItems.length) {
      throw orderError(400, 'Enter one product code for each item in your cart.');
    }

    const verifiedItems = [];
    for (const item of orderItems) {
      if (!mongoose.isValidObjectId(item.product) || !item.sku || !item.productCode ||
          !Number.isInteger(item.quantity) || item.quantity < 1) {
        throw orderError(400, 'Each cart item needs a valid product, code, and quantity.');
      }

      const product = await Product.findById(item.product);
      if (!product || product.productCode !== String(item.productCode).trim().toUpperCase()) {
        throw orderError(400, 'A product code does not match the selected shelf.');
      }
      const variant = product.variants.find((entry) => entry.sku === item.sku);
      if (!variant) {
        throw orderError(400, `${product.name} has an invalid product option.`);
      }

      const stockUpdate = await Product.updateOne(
        {
          _id: product._id,
          variants: { $elemMatch: { sku: variant.sku, stock: { $gte: item.quantity } } },
        },
        { $inc: { 'variants.$.stock': -item.quantity } }
      );
      if (stockUpdate.modifiedCount !== 1) {
        throw orderError(409, `${product.name} does not have enough stock.`);
      }
      reservedItems.push({ productId: product._id, sku: variant.sku, quantity: item.quantity });

      verifiedItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0].url,
        sku: variant.sku,
        productCode: product.productCode,
        price: variant.price,
        quantity: item.quantity,
      });
    }

    const expectedCodes = verifiedItems.map((item) => item.productCode).sort();
    const submittedCodes = [...enteredCodes].sort();
    if (expectedCodes.some((code, index) => code !== submittedCodes[index])) {
      throw orderError(400, 'The entered product codes do not match your cart.');
    }

    const itemsPrice = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxPrice = 0;
    const shippingPrice = 0;
    const codFee = 100;
    const order = await Order.create({
      customerName: name,
      customerPhone: phone,
      productCode: verifiedItems.map((item) => item.productCode).join(', '),
      customerAddress,
      orderItems: verifiedItems,
      paymentMethod: 'Cash on Delivery',
      itemsPrice,
      taxPrice,
      shippingPrice,
      codFee,
      totalPrice: itemsPrice + codFee,
    });

    res.status(201).json({
      orderId: order._id,
      status: order.status,
      paymentMethod: order.paymentMethod,
      itemsPrice: order.itemsPrice,
      taxPrice: order.taxPrice,
      shippingPrice: order.shippingPrice,
      codFee: order.codFee,
      totalPrice: order.totalPrice,
    });
  } catch (error) {
    await Promise.all(reservedItems.map(({ productId, sku, quantity }) =>
      Product.updateOne(
        { _id: productId, 'variants.sku': sku },
        { $inc: { 'variants.$.stock': quantity } }
      )
    ));
    res.status(error.statusCode || 500).json({ message: error.message || 'Unable to place your order.' });
  }
};

exports.listOrders = async (req, res) => {
  const filter = orderStatuses.includes(req.query.status) ? { status: req.query.status } : {};
  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(500).lean();
  res.status(200).json({ orders });
};

exports.updateOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found.' });

  const { status, isPaid } = req.body;
  if (status !== undefined && !orderStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid order status.' });
  }
  if (order.status === 'Cancelled' && status && status !== 'Cancelled') {
    return res.status(409).json({ message: 'Cancelled orders cannot be reopened.' });
  }
  if (status === 'Cancelled' && ['Shipped', 'Delivered'].includes(order.status)) {
    return res.status(409).json({ message: 'Shipped or delivered orders cannot be cancelled.' });
  }
  if (isPaid !== undefined && typeof isPaid !== 'boolean') {
    return res.status(400).json({ message: 'Cash received must be true or false.' });
  }
  if (isPaid === true && status !== 'Delivered' && order.status !== 'Delivered') {
    return res.status(409).json({ message: 'Cash can be marked received after delivery.' });
  }

  if (status === 'Cancelled' && order.status !== 'Cancelled') {
    await Promise.all(order.orderItems.map((item) =>
      Product.updateOne(
        { _id: item.product, 'variants.sku': item.sku },
        { $inc: { 'variants.$.stock': item.quantity } }
      )
    ));
  }

  if (status !== undefined) {
    order.status = status;
    if (status === 'Delivered' && !order.deliveredAt) order.deliveredAt = new Date();
  }
  if (req.body.trackingNumber !== undefined) {
    order.trackingNumber = String(req.body.trackingNumber).trim().slice(0, 100);
  }
  if (isPaid !== undefined) {
    order.isPaid = isPaid;
    order.paidAt = isPaid ? new Date() : undefined;
    order.cashCollectedAt = isPaid ? new Date() : undefined;
  }

  await order.save();
  res.status(200).json({ order });
};
