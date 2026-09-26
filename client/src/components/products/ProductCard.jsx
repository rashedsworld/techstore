import React from 'react';
import { useDispatch } from 'react-redux';
import { Star, ShoppingBag, Check } from 'lucide-react';
import { addToCartLocal } from '../../redux/slices/cartSlice';
import { Badge } from '../ui/Badge';
import { formatTaka } from '../../lib/utils';

export const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const [added, setAdded] = React.useState(false);

  // Default image fallback
  const mainImage = product.images && product.images.length > 0 
    ? product.images[0].url 
    : 'https://via.placeholder.com/400x400?text=No+Image';

  const defaultVariant = product.variants && product.variants.length > 0 
    ? product.variants[0] 
    : { sku: 'DEFAULT', price: product.basePrice, stock: 10 };

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch(
      addToCartLocal({
        product: product._id,
        productCode: product.productCode,
        name: product.name,
        image: mainImage,
        sku: defaultVariant.sku,
        stock: defaultVariant.stock,
        price: defaultVariant.price,
        quantity: 1,
      })
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group relative bg-white rounded-xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col">
      {/* Image Container with Badges */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden">
        <img
          src={mainImage}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.isFeatured && <Badge variant="success">Featured</Badge>}
          {defaultVariant.stock < 5 && defaultVariant.stock > 0 && (
            <Badge variant="warning">Low Stock</Badge>
          )}
          {defaultVariant.stock === 0 && <Badge variant="danger">Out of Stock</Badge>}
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="text-xs font-medium text-indigo-600 mb-1 uppercase tracking-wider">
          {product.category}
        </div>
        <p className="mb-1 text-xs text-slate-500">Product code: {product.productCode}</p>
        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">
          <a href={`/products/${product._id}`}>{product.name}</a>
        </h3>

        {/* Rating Metrics */}
        <div className="flex items-center gap-1 mb-3">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-medium text-slate-700">
            {product.ratings?.average ? product.ratings.average.toFixed(1) : '4.5'}
          </span>
          <span className="text-xs text-slate-400">
            ({product.ratings?.count || 0})
          </span>
        </div>

        {/* Price & Add to Cart Footer */}
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-50">
          <div>
            <span className="text-lg font-bold text-slate-900">
              {formatTaka(defaultVariant.price)}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={defaultVariant.stock === 0}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {added ? (
              <>
                <Check className="h-3.5 w-3.5" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};