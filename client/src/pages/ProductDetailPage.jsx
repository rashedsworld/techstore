import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Star, ShieldCheck, Truck, RotateCcw, ShoppingBag, Check, Plus, Minus } from 'lucide-react';
import { addToCartLocal } from '../redux/slices/cartSlice';
import { Header } from '../components/layout/header';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatTaka } from '../lib/utils';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (res.ok) {
          setProduct(data);
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-slate-200 rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-20 bg-slate-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
          <Button className="mt-4" onClick={() => navigate('/products')}>
            Back to Catalog
          </Button>
        </div>
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.basePrice;
  const currentStock = selectedVariant ? selectedVariant.stock : 10;
  const mainImage = product.images?.[selectedImage]?.url || 'https://via.placeholder.com/600';

  const handleAddToCart = () => {
    dispatch(
      addToCartLocal({
        product: product._id,
        productCode: product.productCode,
        name: product.name,
        image: mainImage,
        sku: selectedVariant ? selectedVariant.sku : 'DEFAULT',
        stock: currentStock,
        price: currentPrice,
        quantity,
      })
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Gallery Column */}
            <div className="space-y-4">
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-100 relative">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {currentStock < 5 && currentStock > 0 && (
                  <Badge variant="warning" className="absolute top-4 left-4">
                    Low Stock: {currentStock} left
                  </Badge>
                )}
              </div>

              {/* Thumbnail Selector */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={img.public_id || idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`h-20 w-20 rounded-lg border-2 overflow-hidden shrink-0 transition-all ${
                        selectedImage === idx ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Options & Details */}
            <div className="flex flex-col">
              <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
                {product.brand} • {product.category}
              </div>
              <p className="mb-2 text-xs text-slate-500">Product code: {product.productCode}</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">{product.name}</h1>

              {/* Rating Summary */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  {product.ratings?.average ? product.ratings.average.toFixed(1) : '4.8'}
                </span>
                <span className="text-sm text-slate-400">
                  ({product.ratings?.count || 24} reviews)
                </span>
              </div>

              {/* Pricing */}
              <div className="text-3xl font-extrabold text-slate-900 mb-6">
                {formatTaka(currentPrice)}
              </div>

              {/* Variants Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6 space-y-3">
                  <label className="text-sm font-semibold text-slate-800">
                    Select Variant / Option:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.sku}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-4 py-2 text-xs font-medium rounded-lg border transition-all ${
                          selectedVariant?.sku === variant.sku
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100'
                            : 'border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {variant.color} / {variant.size} - {formatTaka(variant.price)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-8 space-y-3">
                <label className="text-sm font-semibold text-slate-800">Quantity:</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2 text-slate-600 hover:text-slate-900"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 text-sm font-semibold text-slate-800">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                      className="p-2 text-slate-600 hover:text-slate-900"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-500">
                    {currentStock} items in stock
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-8">
                <Button
                  onClick={handleAddToCart}
                  disabled={currentStock === 0}
                  className="flex-1 py-3"
                  size="lg"
                >
                  {added ? (
                    <>
                      <Check className="h-5 w-5 mr-2" /> Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-5 w-5 mr-2" /> Add to Cart
                    </>
                  )}
                </Button>
              </div>

              {/* Value Propositions */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100 text-center">
                <div className="flex flex-col items-center">
                  <Truck className="h-5 w-5 text-indigo-600 mb-1" />
                  <span className="text-[11px] font-medium text-slate-600">Free Express Delivery</span>
                </div>
                <div className="flex flex-col items-center">
                  <ShieldCheck className="h-5 w-5 text-indigo-600 mb-1" />
                  <span className="text-[11px] font-medium text-slate-600">2 Year Warranty</span>
                </div>
                <div className="flex flex-col items-center">
                  <RotateCcw className="h-5 w-5 text-indigo-600 mb-1" />
                  <span className="text-[11px] font-medium text-slate-600">30-Day Returns</span>
                </div>
              </div>

            </div>
          </div>

          {/* Accordion / Tab Section */}
          <div className="mt-12 pt-8 border-t border-slate-100">
            <div className="flex border-b border-slate-200 gap-8 mb-6">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-3 text-sm font-semibold transition-colors relative ${
                  activeTab === 'description' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-3 text-sm font-semibold transition-colors relative ${
                  activeTab === 'specs' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Specifications
              </button>
            </div>

            {activeTab === 'description' ? (
              <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                {product.description}
              </p>
            ) : (
              <div className="text-sm text-slate-600 space-y-2 max-w-xl">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-medium text-slate-800">Brand</span>
                  <span>{product.brand}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-medium text-slate-800">Category</span>
                  <span>{product.category}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-medium text-slate-800">SKU</span>
                  <span>{selectedVariant?.sku || 'N/A'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};