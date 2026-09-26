import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/layout/header';
import { Button } from '../components/ui/Button';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to send reset email.');
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError.message || 'Unable to send reset email. Please try again.');
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
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Forgot your password?</h1>
          <p className="mt-2 text-sm text-slate-600">Enter your account email and we’ll send a reset link if it matches an account.</p>
          {message ? (
            <p role="status" className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{message}</p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="reset-email" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
              <Button type="submit" isLoading={loading} className="w-full">Send reset link</Button>
            </form>
          )}
          <Link to="/login" className="mt-5 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Back to sign in
          </Link>
        </div>
      </main>
    </div>
  );
};
