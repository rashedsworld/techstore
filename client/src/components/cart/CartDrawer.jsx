import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { removeFromCartLocal, updateCartQuantity } from '../../redux/slices/cartSlice';
import { Button } from '../ui/Button';
import { formatTaka } from '../../lib/utils';

export const CartDrawer = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const closeButtonRef = useRef(null);
  const { items } = useSelector((state) => state.cart);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close cart"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <div>
              <h2 id="cart-title" className="text-base font-semibold text-slate-900">Your cart</h2>
              <p className="text-xs text-slate-500">{itemCount} {itemCount === 1 ? 'shelf' : 'shelves'}</p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <ShoppingBag className="h-7 w-7" />
            </span>
            <h3 className="text-base font-semibold text-slate-900">Your cart is empty</h3>
            <p className="mt-1 max-w-xs text-sm text-slate-500">Browse the miniature shelves and add one to your cart.</p>
            <Button
              type="button"
              variant="outline"
              className="mt-5"
              onClick={() => {
                onClose();
                navigate('/products');
              }}
            >
              Browse shelves
            </Button>
          </div>
        ) : (
          <>
            <ul className="min-h-0 flex-1 divide-y divide-slate-200 overflow-y-auto px-5 sm:px-6">
              {items.map((item) => {
                const stock = item.stock || 10;
                return (
                  <li key={`${item.product}-${item.sku}`} className="flex gap-4 py-5">
                    <img
                      src={item.image || 'https://via.placeholder.com/96'}
                      alt={item.name}
                      className="h-20 w-20 shrink-0 rounded-lg border border-slate-200 object-cover sm:h-24 sm:w-24"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900">{item.name}</h3>
                          <p className="mt-1 text-xs font-medium uppercase text-slate-500">Code {item.productCode}</p>
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name} from cart`}
                          title="Remove from cart"
                          onClick={() => dispatch(removeFromCartLocal({ product: item.product, sku: item.sku }))}
                          className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Remove</span>
                        </button>
                      </div>
                      <div className="mt-3 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs text-slate-500">{formatTaka(item.price)} each</p>
                          <div className="mt-2 inline-flex h-9 items-center rounded-md border border-slate-300">
                            <button
                              type="button"
                              aria-label={`Decrease ${item.name} quantity`}
                              disabled={item.quantity <= 1}
                              onClick={() => dispatch(updateCartQuantity({
                                product: item.product,
                                sku: item.sku,
                                quantity: item.quantity - 1,
                              }))}
                              className="flex h-8 w-8 items-center justify-center text-slate-600 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <output aria-live="polite" className="w-8 text-center text-sm font-medium text-slate-900">
                              {item.quantity}
                            </output>
                            <button
                              type="button"
                              aria-label={`Increase ${item.name} quantity`}
                              disabled={item.quantity >= stock}
                              onClick={() => dispatch(updateCartQuantity({
                                product: item.product,
                                sku: item.sku,
                                quantity: item.quantity + 1,
                              }))}
                              className="flex h-8 w-8 items-center justify-center text-slate-600 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="whitespace-nowrap text-sm font-semibold text-slate-900">
                          {formatTaka(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <footer className="shrink-0 border-t border-slate-200 bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-6">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <dt>Items subtotal</dt>
                  <dd>{formatTaka(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-slate-600">
                  <dt>Cash on Delivery fee</dt>
                  <dd>{formatTaka(100)}</dd>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
                  <dt>Total due on delivery</dt>
                  <dd>{formatTaka(subtotal + 100)}</dd>
                </div>
              </dl>
              <p className="mt-2 text-xs text-slate-500">Pay the courier in cash when your order arrives.</p>
              <Button
                type="button"
                className="mt-4 w-full"
                size="lg"
                onClick={() => {
                  onClose();
                  navigate('/checkout');
                }}
              >
                Continue to order <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
};