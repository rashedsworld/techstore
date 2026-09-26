const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  sku: { type: String, required: true },
  color: { type: String, required: true },
  size: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    productCode: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      index: true,
    },
    brand: {
      type: String,
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true }, // Cloudinary asset ID
      },
    ],
    variants: [variantSchema],
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for fast full-text searching across product metadata
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema);