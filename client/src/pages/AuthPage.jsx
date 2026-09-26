import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Header } from '../components/layout/header';
import { Button } from '../components/ui/Button';
import { setCredentials } from '../redux/slices/authSlice';

export const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isRegistering = location.pathname === '/register';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/auth/${isRegistering ? 'register' : 'login'}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to sign in.');

      dispatch(setCredentials(data));
      navigate(location.state?.from || '/products', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-md px-4 py-12 sm:py-16">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Tiny Tome account</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            {isRegistering ? 'Create your account' : 'Sign in'}
          </h1>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {isRegistering && (
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">Name</label>
                <input
                  id="name"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input
                id="password"
                type="password"
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                required
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
            <Button type="submit" isLoading={loading} className="w-full">
              {isRegistering ? 'Create account' : 'Sign in'}
            </Button>
          </form>
          {!isRegistering && (
            <Link to="/forgot-password" className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Forgot password?
            </Link>
          )}
          <p className="mt-5 text-sm text-slate-600">
            {isRegistering ? 'Already have an account?' : 'New to Tiny Tome?'}{' '}
            <Link
              to={isRegistering ? '/login' : '/register'}
              state={location.state}
              className="font-medium text-indigo-600 hover:text-indigo-700"
            >
              {isRegistering ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};
