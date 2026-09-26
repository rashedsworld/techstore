const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');
const mongoose = require('mongoose');

// @desc    Get all products with searching, filtering, sorting & pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice, rating, sortBy, page = 1, limit = 12 } = req.query;

    const query = {};

    // 1. Full-text search on product title & description
    if (keyword) {
      const normalizedKeyword = keyword.trim().toUpperCase();
      if (/^[A-Z0-9]+(?:-[A-Z0-9]+)+$/.test(normalizedKeyword)) {
        query.productCode = normalizedKeyword;
      } else {
        query.$text = { $search: keyword };
      }
    }

    // 2. Category filter
    if (category) {
      query.category = category;
    }

    // 3. Price range filter
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }

    // 4. Rating filter
    if (rating) {
      query['ratings.average'] = { $gte: Number(rating) };
    }

    // 5. Sorting logic
    let sortOptions = {};
    if (sortBy === 'priceAsc') sortOptions.basePrice = 1;
    else if (sortBy === 'priceDesc') sortOptions.basePrice = -1;
    else if (sortBy === 'topRated') sortOptions['ratings.average'] = -1;
    else sortOptions.createdAt = -1; // Default to newest first

    // 6. Pagination calculation
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      products,
      page: pageNum,
      pages: Math.ceil(totalProducts / limitNum),
      totalProducts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// @desc    Get single product by ID or slug
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving product', error: error.message });
  }
};

// @desc    Create product with image uploads
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const { productCode, name, slug, description, category, brand, basePrice, variants } = req.body;

    // Handle Cloudinary image upload responses
    const imageFiles = req.files || [];
    const images = imageFiles.map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));

    const parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;

    const product = new Product({
      productCode: productCode || `TT-${new mongoose.Types.ObjectId().toString().slice(-8).toUpperCase()}`,
      name,
      slug,
      description,
      category,
      brand,
      basePrice,
      images,
      variants: parsedVariants || [],
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

// @desc    Delete product and its Cloudinary images
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Remove images from Cloudinary storage
    for (const image of product.images) {
      if (image.public_id) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    }

    await product.deleteOne();
    res.status(200).json({ message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};