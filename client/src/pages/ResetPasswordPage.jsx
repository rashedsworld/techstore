import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Header } from '../components/layout/header';
import { Button } from '../components/ui/Button';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    if (!token) {
      setError('This reset link is invalid or expired. Request a new one.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to reset password.');
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError.message || 'Unable to reset password. Please request a new link.');
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
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Set a new password</h1>
          {message ? (
            <div className="mt-6 space-y-4">
              <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{message}</p>
              <Link to="/login" className="inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700">Back to sign in</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-slate-700">New password</label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={72}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-slate-700">Confirm new password</label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={72}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
              <Button type="submit" isLoading={loading} className="w-full">Reset password</Button>
            </form>
          )}
          {!message && (
            <Link to="/forgot-password" className="mt-5 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Request another reset link
            </Link>
          )}
        </div>
      </main>
    </div>
  );
};
