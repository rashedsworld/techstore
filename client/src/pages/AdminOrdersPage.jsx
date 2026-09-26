import React, { useEffect, useState } from 'react';
import { RefreshCw, Save } from 'lucide-react';
import { Header } from '../components/layout/header';
import { Button } from '../components/ui/Button';
import { formatTaka } from '../lib/utils';

const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const loadOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const query = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : '';
        const response = await fetch(`/api/orders${query}`, {
          credentials: 'include',
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Unable to load orders.');
        setOrders(data.orders || []);
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message || 'Unable to load orders.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadOrders();
    return () => controller.abort();
  }, [statusFilter, refreshToken]);

  const updateOrder = async (orderId, changes) => {
    setUpdatingId(orderId);
    setError('');
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to update order.');
      setOrders((current) => current.map((order) => order._id === orderId ? data.order : order));
    } catch (requestError) {
      setError(requestError.message || 'Unable to update order.');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Tiny Tome</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Order management</h1>
            <p className="mt-2 text-sm text-slate-500">Customer information is restricted to administrator accounts.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-600">
              <span className="sr-only">Filter orders by status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2"
              >
                <option value="">All orders</option>
                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRefreshToken((current) => current + 1)}
              aria-label="Refresh orders"
              title="Refresh orders"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {error && <p role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        {loading ? (
          <p role="status" className="py-12 text-center text-sm text-slate-500">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">No orders found.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="min-w-295 w-full border-collapse text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Products</th>
                  <th className="px-4 py-3">Delivery address</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">COD received</th>
                  <th className="px-4 py-3">Tracking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map((order) => (
                  <OrderRow
                    key={order._id}
                    order={order}
                    updating={updatingId === order._id}
                    onUpdate={updateOrder}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

const OrderRow = ({ order, updating, onUpdate }) => {
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');

  return (
    <tr className="align-top text-slate-700">
      <td className="px-4 py-4">
        <p className="font-semibold text-slate-900">#{order._id.slice(-8).toUpperCase()}</p>
        <p className="mt-1 text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
      </td>
      <td className="max-w-52 px-4 py-4">
        <p className="font-medium text-slate-900">{order.customerName}</p>
        <a className="mt-1 block text-indigo-700 underline" href={`tel:${order.customerPhone}`}>{order.customerPhone}</a>
      </td>
      <td className="max-w-64 px-4 py-4">
        <p className="font-medium text-slate-900">{order.productCode}</p>
        {order.orderItems.map((item) => (
          <p key={`${item.productCode}-${item.sku}`} className="mt-1 text-xs text-slate-600">
            {item.name} × {item.quantity}
          </p>
        ))}
      </td>
      <td className="max-w-64 whitespace-normal px-4 py-4">{order.customerAddress}</td>
      <td className="whitespace-nowrap px-4 py-4">
        <p className="font-semibold text-slate-900">{formatTaka(order.totalPrice)}</p>
        <p className="mt-1 text-xs text-slate-500">Cash on Delivery</p>
        <p className="text-xs text-slate-500">COD fee: {formatTaka(order.codFee)}</p>
      </td>
      <td className="px-4 py-4">
        <label className="sr-only" htmlFor={`status-${order._id}`}>Status for order {order._id}</label>
        <select
          id={`status-${order._id}`}
          value={order.status}
          disabled={updating || order.status === 'Cancelled'}
          onChange={(event) => onUpdate(order._id, { status: event.target.value })}
          className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs disabled:opacity-50"
        >
          {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </td>
      <td className="px-4 py-4">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={order.isPaid}
            disabled={updating || (!order.isPaid && order.status !== 'Delivered')}
            onChange={(event) => onUpdate(order._id, { isPaid: event.target.checked })}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          {order.isPaid ? 'Received' : 'Not received'}
        </label>
      </td>
      <td className="px-4 py-4">
        <div className="flex min-w-48 items-center gap-2">
          <input
            type="text"
            aria-label={`Tracking number for order ${order._id}`}
            value={trackingNumber}
            onChange={(event) => setTrackingNumber(event.target.value)}
            placeholder="Tracking number"
            maxLength={100}
            className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-xs"
          />
          <button
            type="button"
            disabled={updating}
            onClick={() => onUpdate(order._id, { trackingNumber })}
            title="Save tracking number"
            aria-label={`Save tracking number for order ${order._id}`}
            className="rounded-md border border-slate-300 p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};
