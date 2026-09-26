require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const products = [
  {
    productCode: 'MBS-001',
    name: 'The Reading Nook Miniature Bookshelf',
    slug: 'reading-nook-miniature-bookshelf',
    description: 'A warm little reading corner with tiny books, a window seat, and soft amber light.',
    category: 'Miniature Bookshelves',
    brand: 'Tiny Tome',
    basePrice: 44.99,
    images: [{
      url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=900&q=85',
      public_id: 'seed-mbs-001',
    }],
    variants: [{ sku: 'MBS-001', color: 'Honey oak', size: '12 cm', price: 44.99, stock: 12 }],
    ratings: { average: 4.9, count: 28 },
  },
  {
    productCode: 'MBS-002',
    name: 'Enchanted Forest Book Nook Shelf',
    slug: 'enchanted-forest-book-nook-shelf',
    description: 'A woodland-inspired miniature shelf with leafy details and a hidden path between books.',
    category: 'Miniature Bookshelves',
    brand: 'Tiny Tome',
    basePrice: 52.99,
    images: [{
      url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=85',
      public_id: 'seed-mbs-002',
    }],
    variants: [{ sku: 'MBS-002', color: 'Forest green', size: '14 cm', price: 52.99, stock: 10 }],
    ratings: { average: 4.8, count: 19 },
  },
  {
    productCode: 'MBS-003',
    name: 'Old Town Bookshop Mini Shelf',
    slug: 'old-town-bookshop-mini-shelf',
    description: 'A tiny storybook shopfront with tall shelves, stacked reads, and vintage charm.',
    category: 'Miniature Bookshelves',
    brand: 'Tiny Tome',
    basePrice: 59.99,
    images: [{
      url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=85',
      public_id: 'seed-mbs-003',
    }],
    variants: [{ sku: 'MBS-003', color: 'Walnut', size: '15 cm', price: 59.99, stock: 8 }],
    ratings: { average: 4.9, count: 16 },
  },
  {
    productCode: 'MBS-004',
    name: 'Moonlit Library Miniature Shelf',
    slug: 'moonlit-library-miniature-shelf',
    description: 'A midnight-blue library nook made for tiny tales and quiet evenings.',
    category: 'Miniature Bookshelves',
    brand: 'Tiny Tome',
    basePrice: 48.99,
    images: [{
      url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=85',
      public_id: 'seed-mbs-004',
    }],
    variants: [{ sku: 'MBS-004', color: 'Midnight blue', size: '12 cm', price: 48.99, stock: 14 }],
    ratings: { average: 4.7, count: 11 },
  },
  {
    productCode: 'MBS-005',
    name: 'Secret Garden Story Shelf',
    slug: 'secret-garden-story-shelf',
    description: 'A floral miniature book corner with climbing vines and a tucked-away garden gate.',
    category: 'Miniature Bookshelves',
    brand: 'Tiny Tome',
    basePrice: 54.99,
    images: [{
      url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85',
      public_id: 'seed-mbs-005',
    }],
    variants: [{ sku: 'MBS-005', color: 'Sage', size: '14 cm', price: 54.99, stock: 9 }],
    ratings: { average: 4.8, count: 14 },
  },
  {
    productCode: 'MBS-006',
    name: 'The Little Scholar Study Nook',
    slug: 'little-scholar-study-nook',
    description: 'A classic tiny study with a writing desk, book stacks, and warm wood finishes.',
    category: 'Miniature Bookshelves',
    brand: 'Tiny Tome',
    basePrice: 46.99,
    images: [{
      url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=85',
      public_id: 'seed-mbs-006',
    }],
    variants: [{ sku: 'MBS-006', color: 'Natural maple', size: '12 cm', price: 46.99, stock: 15 }],
    ratings: { average: 4.6, count: 9 },
  },
  {
    productCode: 'MBS-007',
    name: 'Rainy Day Window Book Nook',
    slug: 'rainy-day-window-book-nook',
    description: 'A snug window-side reading nook with miniature books and a rainy-day mood.',
    category: 'Miniature Bookshelves',
    brand: 'Tiny Tome',
    basePrice: 49.99,
    images: [{
      url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=85',
      public_id: 'seed-mbs-007',
    }],
    variants: [{ sku: 'MBS-007', color: 'Chestnut', size: '13 cm', price: 49.99, stock: 11 }],
    ratings: { average: 4.8, count: 13 },
  },
  {
    productCode: 'MBS-008',
    name: 'Starlight Archive Mini Shelf',
    slug: 'starlight-archive-mini-shelf',
    description: 'A celestial archive nook with deep plum tones and shelves for little discoveries.',
    category: 'Miniature Bookshelves',
    brand: 'Tiny Tome',
    basePrice: 57.99,
    images: [{
      url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=900&q=85',
      public_id: 'seed-mbs-008',
    }],
    variants: [{ sku: 'MBS-008', color: 'Plum', size: '15 cm', price: 57.99, stock: 7 }],
    ratings: { average: 4.9, count: 17 },
  },
  {
    productCode: 'MBS-009',
    name: 'Seaside Stories Miniature Shelf',
    slug: 'seaside-stories-miniature-shelf',
    description: 'A breezy coastal reading nook with pale timber and a stack of tiny adventures.',
    category: 'Miniature Bookshelves',
    brand: 'Tiny Tome',
    basePrice: 45.99,
    images: [{
      url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=900&q=85',
      public_id: 'seed-mbs-009',
    }],
    variants: [{ sku: 'MBS-009', color: 'Driftwood', size: '12 cm', price: 45.99, stock: 13 }],
    ratings: { average: 4.7, count: 10 },
  },
  {
    productCode: 'MBS-010',
    name: 'Heritage Oak Mini Bookcase',
    slug: 'heritage-oak-mini-bookcase',
    description: 'A timeless miniature bookcase with old-library character and carefully stacked volumes.',
    category: 'Miniature Bookshelves',
    brand: 'Tiny Tome',
    basePrice: 62.99,
    images: [{
      url: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=85',
      public_id: 'seed-mbs-010',
    }],
    variants: [{ sku: 'MBS-010', color: 'Dark oak', size: '16 cm', price: 62.99, stock: 6 }],
    ratings: { average: 4.9, count: 21 },
  },
];

const previousDemoSlugs = [
  'wireless-noise-canceling-headphones',
  'mechanical-gaming-keyboard',
];
const shelfPriceBdt = 400;

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany({ slug: { $in: previousDemoSlugs } });
    for (const product of products) {
      await Product.updateOne(
        { productCode: product.productCode },
        { $setOnInsert: product },
        { upsert: true }
      );
    }
    await Product.updateMany(
      { productCode: { $in: products.map((product) => product.productCode) } },
      { $set: { basePrice: shelfPriceBdt, 'variants.$[].price': shelfPriceBdt } }
    );
    console.log('Miniature bookshelf products are available.');
  } catch (error) {
    console.error('Product seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedProducts();