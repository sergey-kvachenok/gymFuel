'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Registration failed');
      return;
    }
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-8 border"
        data-testid="register-form"
      >
        <h1 className="text-2xl font-bold text-center mb-2" data-testid="register-title">
          Create account
        </h1>
        {error && (
          <div className="text-red-500 text-sm text-center" data-testid="register-error">
            {error}
          </div>
        )}
        <div className="space-y-6 flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 px-6 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-base bg-white placeholder-gray-400"
            data-testid="register-email"
          />
          <input
            type="text"
            placeholder="Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 px-6 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-base bg-white placeholder-gray-400"
            data-testid="register-name"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 px-6 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-base bg-white placeholder-gray-400"
            data-testid="register-password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed text-base mt-2"
          data-testid="register-submit"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
        <div className="text-center text-sm mt-4">
          Already have an account?{' '}
          <a
            href="/login"
            className="text-blue-600 hover:underline"
            data-testid="register-login-link"
          >
            Login
          </a>
        </div>
      </form>
    </div>
  );
}
