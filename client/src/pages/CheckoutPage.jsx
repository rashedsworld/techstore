import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, MapPin, PackageCheck, ShoppingBag } from 'lucide-react';
import { clearCart } from '../redux/slices/cartSlice';
import { Header } from '../components/layout/header';
import { Button } from '../components/ui/Button';
import { formatTaka } from '../lib/utils';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector((state) => state.cart);

  const [step, setStep] = useState(1); // 1: Shipping, 2: Confirmation
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [checkoutError, setCheckoutError] = useState('');
  const [serverTotals, setServerTotals] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [productCode, setProductCode] = useState(() => items.map((item) => item.productCode).filter(Boolean).join(', '));
  const [address, setAddress] = useState('');

  const cartSubtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const subtotal = serverTotals?.itemsPrice ?? cartSubtotal;
  const codFee = serverTotals?.codFee ?? 100;
  const grandTotal = serverTotals?.totalPrice ?? subtotal + codFee;

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    const enteredCodes = productCode.split(',').map((code) => code.trim()).filter(Boolean);
    if (!customerName.trim() || !customerPhone.trim() || !address.trim()) {
      setCheckoutError('Complete your name, phone number, and delivery address.');
      return;
    }
    if (enteredCodes.length !== items.length) {
      setCheckoutError('Enter one product code for every item in your cart.');
      return;
    }

    setLoading(true);
    setCheckoutError('');
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        credentials: 'omit',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          productCode,
          address,
          orderItems: items.map((item) => ({
            product: item.product,
            productCode: item.productCode,
            sku: item.sku,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to place your order.');

      setOrderId(data.orderId);
      setServerTotals({
        itemsPrice: data.itemsPrice,
        codFee: data.codFee,
        totalPrice: data.totalPrice,
      });
      dispatch(clearCart());
      setStep(2);
    } catch (error) {
      setCheckoutError(error.message || 'Unable to place your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && step !== 2) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <ShoppingBag className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Your Cart is Empty</h2>
          <p className="text-slate-500 text-sm mt-2 mb-6">Add items to your shopping cart before checking out.</p>
          <Button onClick={() => navigate('/products')}>Browse Products</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Checkout Stepper Progress */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 z-0" />
            
            {[
              { num: 1, label: 'Your details', icon: MapPin },
              { num: 2, label: 'Order confirmed', icon: CheckCircle },
            ].map((s) => {
              const Icon = s.icon;
              const isActive = step >= s.num;
              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center gap-1 bg-slate-50 px-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    isActive ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 text-slate-500'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'text-indigo-600 font-semibold' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {checkoutError && step !== 2 && (
            <p role="alert" className="lg:col-span-12 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {checkoutError}
            </p>
          )}
          
          {/* Main Form Body */}
          <div className="lg:col-span-7">
            {step === 1 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-indigo-600" /> Delivery details
                </h2>
                <div className="mb-6 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <PackageCheck className="h-5 w-5 shrink-0 text-emerald-700" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">Cash on Delivery</p>
                    <p className="text-xs text-emerald-800">Pay in cash on delivery. COD fee: {formatTaka(codFee)} per order.</p>
                  </div>
                </div>
                <form onSubmit={handleOrderSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="customer-name" className="mb-1 block text-xs font-semibold text-slate-700">Full name *</label>
                    <input
                      id="customer-name"
                      type="text"
                      required
                      autoComplete="name"
                      maxLength={100}
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      placeholder="Your name"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="customer-phone" className="mb-1 block text-xs font-semibold text-slate-700">Phone number *</label>
                    <input
                      id="customer-phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      maxLength={24}
                      value={customerPhone}
                      onChange={(event) => setCustomerPhone(event.target.value)}
                      placeholder="+1 555 123 4567"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="product-code" className="mb-1 block text-xs font-semibold text-slate-700">Product code(s) *</label>
                    <input
                      id="product-code"
                      type="text"
                      required
                      value={productCode}
                      onChange={(event) => setProductCode(event.target.value)}
                      placeholder="MBS-001"
                      className="w-full px-3.5 py-2 text-sm uppercase bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="mt-1 text-xs text-slate-500">Use the product code shown on each selected shelf.</p>
                  </div>
                  <div>
                    <label htmlFor="customer-address" className="mb-1 block text-xs font-semibold text-slate-700">Delivery address *</label>
                    <textarea
                      id="customer-address"
                      required
                      rows={3}
                      maxLength={500}
                      autoComplete="street-address"
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      placeholder="Street, area, city, and any delivery instructions"
                      className="w-full resize-y px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <Button type="submit" isLoading={loading} className="w-full mt-6" size="lg">
                    Place COD order
                  </Button>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xs text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
                <h2 className="text-2xl font-bold text-slate-900">Order submitted</h2>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Your order is confirmed. Pay in cash when it is delivered; the total includes a {formatTaka(codFee)} COD fee.
                </p>
                <p className="text-sm font-medium text-slate-700">Cash on Delivery</p>
                <p className="font-semibold text-slate-900">Order total: {formatTaka(grandTotal)}</p>
                {orderId && (
                  <div className="bg-slate-50 py-2 px-4 rounded-lg inline-block text-xs font-mono text-slate-600 border border-slate-200">
                    Order ID: {orderId}
                  </div>
                )}
                <div className="pt-4 flex justify-center gap-4">
                  <Button variant="outline" onClick={() => navigate('/products')}>
                    Continue Shopping
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {step !== 2 && (
            <div className="lg:col-span-5">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4 sticky top-24">
                <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">Order Summary</h3>
                <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={item.image} alt="" className="h-12 w-12 rounded-lg object-cover border border-slate-100" />
                        <div className="truncate">
                          <p className="font-medium text-slate-800 truncate">{item.name}</p>
                          <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                          <p className="text-xs text-slate-400">Code: {item.productCode}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-slate-900 shrink-0">
                        {formatTaka(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-slate-800">{formatTaka(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cash on Delivery fee</span>
                    <span className="font-medium text-slate-800">{formatTaka(codFee)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-100 pt-3">
                    <span>Total</span>
                    <span className="text-indigo-600">{formatTaka(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};